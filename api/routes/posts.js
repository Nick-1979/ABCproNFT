"use strict";

var express = require("express");
var potsAPIRouter = express.Router();
var multer = require("multer");
const nftSchema = require("../data/schema/nftSchema");
var fs = require("fs");
const marketSchema = require("../data/schema/marketSchema");
const Contracts = require("../utils/contracts");
var path = require("path");
const Web3 = require("web3");
const web3 = new Web3("");
const ethers = require("ethers");
require("dotenv").config();
const pinata = require("../utils/ipfs");
const userSchema = require("../data/schema/userSchema");
const utils = require("../utils/general");
var upload = multer({ dest: "uploads/" });
var FormData = require("form-data");

const getTraitValue = (artJson, traitType) => {
  console.log("getTraitValue", traitType);
  if (artJson) {
    let record = artJson.attributes.find(
      (attr) => attr.trait_type === traitType
    );
    return record.value ? record.value : null;
  }
};
initialize();
async function initialize() {
  console.log("------------initializing--------------------");

  //get all onAuctions from marketSchema
  let onAuctionAuctions = await marketSchema
    .find({
      status: AUCTION_STATUS.ONAUCTION,
    })
    .exec();

    console.log(`There are ${onAuctionAuctions.length} onAuction auctions to check`)


  //get endTime for those onAuctions then compare and setStatus
  if (onAuctionAuctions.length) {
    onAuctionAuctions.map(async (auction) => {
      let endTime = await Contracts.getAuctionEndTime(auction.auctionId);

      if (endTime)
        utils.updateStatusWithEndTimeAfterServerRestart(auction, endTime);
      else {
        //auction is canceled or setteled , check owner to find that
        utils.updateStatusWithoutEndTimeAfterServerRestart(auction);
      }
    });
  }

  //USE CAUTION:********check and set owner of all tokens may take times!!!******
  Contracts.checkAndSetOwners();
}

const getNftMarketAfterFirstSale = (_market) =>
  _market.toUpperCase() === "ABCPRO" ? NFT_MARKETS.ABCPRO : NFT_MARKETS.OPENSEA;

potsAPIRouter.post("/pinJSON", async (req, res, next) => {
  console.log("/pinJSON is called", req.body);
  let jsonData = req.body.jsonData;
  let result = await pinata.pinJSONToIPFS(jsonData);
  console.log("/pinJSON result :", result);

  let nftMarketAfterFirstSale = getNftMarketAfterFirstSale(
    req.body.nftMarketAfterFirstSale
  );

  let userEthAddress = getTraitValue(jsonData, "Artist ETH Address");
  let checksummedUserEthAddress = ethers.utils.getAddress(userEthAddress);

  let nftDdata = {
    userEthAddress: checksummedUserEthAddress,
    jsonCid: result.jsonCid,
    artistName: getTraitValue(jsonData, "Artist Name"),
    fileType: getTraitValue(jsonData, "File Type"),
    artCid: jsonData.image.replace("ipfs://", ""),
    artName: jsonData.name,
    description: jsonData.description,

    reservePrice: req.body.reservePrice,
    royality: req.body.royality,
    creationDate: new Date(),
    nftMarketAfterFirstSale: nftMarketAfterFirstSale,
    // status: req.body.reservePrice ? NFT_STATUS.LISTED : NFT_STATUS.NOTLISTED,
    status: NFT_STATUS.NOTLISTED, //default status
  };

  nftSchema.create(nftDdata, function (error) {
    if (error) {
      console.log(`error while saving nftDdata:%o to db; %o `, nftDdata, error);
    }
  });

  res.send(JSON.stringify(result));
});

potsAPIRouter.post(
  "/pinFile",
  upload.single("file"),
  async (req, res, next) => {
    console.log("/pinFile req body  is called", req.body);
    let isValid = utils.handleSignature(
      req.body.from,
      req.body.textToSign,
      req.body.signature
    );
    if (!isValid) {
      res.status(400).send(JSON.stringify("signature is not correct"));
      return;
    }

    let result = await pinata.pinFileToIPFS(req.file);
    console.log("/pinFile result :", result);
    res.send(JSON.stringify(result));
  }
);

potsAPIRouter.post(
  "/signup",
  upload.single("profilePhoto"),
  async (req, res, next) => {
    try {
      console.log("/signup req body is called", req.body);

      if (!req.body.userEthAddress || !req.body.userId) {
        res.send(
          JSON.stringify({
            success: false,
            text: `id and use address should not be empty`,

          })
        );
        return;
      }

      let checksummedUserEthAddress = ethers.utils.getAddress(
        req.body.userEthAddress
      );

      let userAlreadyExists = await userSchema.exists({
        $or: [
          { userEthAddress: checksummedUserEthAddress },
          { userId: req.body.userId },
        ],
      });

      if (userAlreadyExists) {
        res.send(
          JSON.stringify({
            success: false,
            text:`user already exist`,
          })
        );
        return;
      }

      let isSignatureValid = utils.handleSignature(
        checksummedUserEthAddress,
        req.body.textToBeSigned,
        req.body.signature
      );
      if (!isSignatureValid) {
        res.send(
          JSON.stringify({
            success: false,
            text: `signiture is not correct`,
          })
        );
        return;
      }

      //add @ at the begining of userId if does not exist already
      let userId = req.body.userId;
      if (!userId.startsWith("@")) {
        userId = "@" + userId;
      }

      let userData = {
        userEthAddress: checksummedUserEthAddress,
        userId: userId,
        email: req.body.email,
        fName: req.body.fName,
        lName: req.body.lName,
        bio: req.body.bio,
        tel: req.body.tel,
        twitterId: req.body.twitterId,
        instagramId: req.body.instagramId,
        receiveNews: req.body.receiveNews,
        accountCreationDate: new Date(),
        profilePhoto: {
          data: fs.readFileSync(
            path.resolve(__dirname + "/../uploads/" + req.file.filename)
          ),
          contentType: "image/png",
        },
      };

      let doc = await userSchema.create(userData);
      res.send(
        JSON.stringify({
          success: true,
          text: `user: ${doc.userEthAddress} is created successfully`,

        })
      );
    } catch (e) {
      console.log("something went wrong while saving signup: %o", e);
      res.send(
        JSON.stringify({
          success: false,
          text: " something went wrong while creating user",
        })
      );
    }
  }
);

potsAPIRouter.post("/like", async (req, res, next) => {
  console.log("/like req body  is called", req.body);

  let result = await nftSchema
    .findOne({ jsonCid: req.body.jsonCid }, "likes")
    .exec();

  let likes = new Set(result.likes);
  if (req.body.WalletAddress != null) {
    likes.add(req.body.WalletAddress);
    await nftSchema.findOneAndUpdate(
      { jsonCid: req.body.jsonCid },
      { likes: [...likes] },
      (data) => {
        console.log("data is write to db:", data);
      }
    );
  }
  console.log("/likes after update", likes);
  let response = {
    likeCount: likes.size,
  };

  res.send(JSON.stringify(response));
});

async function attachNftAuctions(_nfts, _userAddress) {
  let auctions = await marketSchema
    .find({
      $or: [
        { status: AUCTION_STATUS.ONAUCTION },
        { status: AUCTION_STATUS.SOLD },
        { status: AUCTION_STATUS.SETTLED },
      ],
    })
    .exec();
  return _nfts.map((nft) => {
    nft = nft.toJSON();
    let auction = {};
    auction = auctions.find((item) => item.auctionId == nft.auctionId);

    /**handle likes */
    if (_userAddress) {
      nft.liked =
        nft.likes.includes(_userAddress) ||
        nft.likes.includes(_userAddress.toLowerCase()) ||
        nft.likes.includes(_userAddress.toUpperCase());
    } else {
      nft.liked = false;
    }
    nft.likes = nft.likes.length;

    return { nft: nft, auction: auction };
  });
}

potsAPIRouter.post("/getAllNFTs", async (req, res, next) => {
  console.log("/ getAllNFTs is called ...", req.body);

  let allNfts = await nftSchema.find().exec();

  let checksummedUserEthAddress = req.body.userEthAddress
    ? ethers.utils.getAddress(req.body.userEthAddress)
    : null;

  //check all nfts auctions,and add its current auction status info to each nft
  let allNftsWithAuctions = await attachNftAuctions(
    allNfts,
    checksummedUserEthAddress //send to check likes
  );

  console.log("allNftsWithAuctions:", allNftsWithAuctions);
  res.send(JSON.stringify(allNftsWithAuctions));
});

potsAPIRouter.post("/getCreatedNftsOf", async (req, res, next) => {
  console.log("/ getCreatedNftsOf is called ...");

  let checksummedUserEthAddress = ethers.utils.getAddress(
    req.body.userEthAddress
  );

  let createdNfts = await nftSchema
    .find({ userEthAddress: checksummedUserEthAddress })
    .exec();

  let createdNftsWithAuctions = await attachNftAuctions(
    createdNfts,
    checksummedUserEthAddress
  );

  res.send(JSON.stringify(createdNftsWithAuctions));
});

potsAPIRouter.post("/getOwnedNftsOf", async (req, res, next) => {
  let checksummedUserEthAddress = ethers.utils.getAddress(
    req.body.userEthAddress
  );

  console.log(
    "/ getOwnedNftsOf is called for user:",
    checksummedUserEthAddress
  );

  let ownedNfts = await nftSchema
    .find({
      owner: checksummedUserEthAddress,
    })
    .exec();
  let ownedNftsWithAuctions = await attachNftAuctions(
    ownedNfts,
    checksummedUserEthAddress
  );

  res.send(JSON.stringify(ownedNftsWithAuctions));
});

potsAPIRouter.post("/getFavoriteNfts", async (req, res, next) => {
  let checksummedUserEthAddress = ethers.utils.getAddress(
    req.body.userEthAddress
  );

  console.log(
    "/ getFavoriteNfts is called for user:",
    checksummedUserEthAddress
  );
  let favoriteNfts = await nftSchema
    .find({
      likes: {
        $in: [checksummedUserEthAddress],
      },
    })
    .exec();
  let favoriteNftsWithAuctions = await attachNftAuctions(
    favoriteNfts,
    checksummedUserEthAddress
  );

  res.send(JSON.stringify(favoriteNftsWithAuctions));
});

potsAPIRouter.post("/userInfo", async (req, res, next) => {
  try {
    console.log(
      `userInfo is called userEthAddress:${req.body.userEthAddress} , userId:${req.body.userId}`
    );
    if (!req.body.userId && !req.body.userEthAddress) {
      res.send(
        JSON.stringify({
          success: false,
          text: `id or user addres should not be empty`,
        })
      );
      return;
    }

    let checksummedUserEthAddress = req.body.userEthAddress
      ? ethers.utils.getAddress(req.body.userEthAddress)
      : null;

    let searchTerm = req.body.userId
      ? { userId: req.body.userId }
      : { userEthAddress: checksummedUserEthAddress };

    let userInfo = await userSchema.findOne(searchTerm).exec();

    console.log("%o is sent to  user", userInfo);
    res.send(JSON.stringify({ success: true, userInfo: userInfo }));
  } catch (e) {
    console.log("something went wrong while getting userinfo  ");
    res.send(JSON.stringify({ success: false, userInfo: null }));
  }
});

potsAPIRouter.post("/getOneNFT", async (req, res, next) => {
  let nonce = Math.floor(Math.random() * 1000000);
  req.session.random = nonce;
  console.log("req.session.random", req.session.random);

  console.log("/nftData is called ...", req.body.jsonCid);
  let nftData = await nftSchema.findOne({ jsonCid: req.body.jsonCid }).exec();
  let auctionData = null;
  if (nftData.auctionId) {
    auctionData = await marketSchema
      .findOne({ auctionId: nftData.auctionId })
      .exec();
  }
  res.send(
    JSON.stringify({ nftData: nftData, auctionData: auctionData, nonce: nonce })
  );
});

potsAPIRouter.post("/aNewBid", async (req, res, next) => {
  console.log("/aNewBid req body  is called", req.body);

  if (!req.body.auctionId) {
    console.log("there is no auctionID!");
    return;
  }

  let doc = await marketSchema
    .findOne({
      auctionId: req.body.auctionId,
    })
    .exec();

  if (!doc) {
    let newAuction = {
      auctionId: req.body.auctionId,
      tokenId: req.body.tokenId,
      status: AUCTION_STATUS.ONAUCTION,
    };
    await utils.createNewAuctionAndUpdateNftSchema(
      newAuction,
      req.body.jsonCid
    );
  }

  let newBid = {
    bidder: req.body.bidder,
    amount: req.body.amount,
    txHash: req.body.txHash,
  };
  let { success, updatedDoc } = await utils.updateBids(
    req.body.auctionId,
    newBid,
    req.body.endTime
  );

  let response = {
    success: success,
    doc: updatedDoc,
  };
  console.log("aNewBid response is:", response);

  res.send(JSON.stringify(response));
});

potsAPIRouter.post("/settle", async (req, res, next) => {
  console.log("/settle is called", req.body);

  let response;
  if (!req.body.auctionId) {
    console.log("there is no auctionID! to settle");
    return;
  }

  let doc = await marketSchema
    .findOne({
      auctionId: req.body.auctionId,
    })
    .exec();

  if (!doc) {
    console.log("there is no doc to settle!!!!!");
    response = {
      success: false,
      message: "There is no auction to settle",
    };
    res.send(JSON.stringify(response));
    return;
  }

  let result = await utils.auctionFinalized(
    req.body.auctionId,
    req.body.settler,
    req.body.settlementHash
  );

  response = {
    success: result.success,
    message: `Auction #${req.body.auctionId} settlement`,
    doc: result.updatedDoc,
  };
  console.log("settlment response is:", response);

  res.send(JSON.stringify(response));
});

/**Get all bids on a NFT using its jsonCid */
potsAPIRouter.post("/bids", async (req, res, next) => {
  console.log("/bids called with jsonCid: ", req.body.auctionId);
  if (!req.body.auctionId) {
    res.send(JSON.stringify(null));
    return;
  }

  let doc = await marketSchema
    .findOne({
      auctionId: req.body.auctionId,
    })
    .exec();

  let response = null;

  if (doc) {
    response = {
      success: true,
      bids: doc.bids,
      endTime: doc.endTime,
      tokenId: doc.tokenId,
      auctionId: doc.auctionId,
      // auctionDuration: process.env.AUCTION_DURATION,
    };
  }
  res.send(JSON.stringify(response));
});

potsAPIRouter.post("/auctionEnded", async (req, res, next) => {
  try {
    console.log("/auctionEnded called with params: ", req.body);
    let response = { success: false };

    if (!req.body.auctionId) {
      response.message = "There is no AuctionId";
      res.send(JSON.stringify(response));
      return;
    }

    let doc = await marketSchema.find({ auctionId: req.body.auctionId }).exec();

    if (!doc) {
      response.message = "There is no doc with such a AuctionId";
      res.send(JSON.stringify(response));
      return;
    }
    if (doc.status !== AUCTION_STATUS.ONAUCTION) {
      response.message = "Can not change status while auction is not ONAUCTION";
      res.send(JSON.stringify(response));
      return;
    }
    doc = await marketSchema.findOneAndUpdate(
      { auctionId: req.body.auctionId },
      { status: AUCTION_STATUS.SOLD },
      { new: true }
    );

    await nftSchema.findOneAndUpdate(
      { auctionId: req.body.auctionId },
      { status: NFT_STATUS.SOLD }
    );

    response = { success: true, status: doc.Status };
    res.send(JSON.stringify(response));
  } catch (e) {
    console.log("Something went wrong in auctionEnded:", e);
    res.send(JSON.stringify({ success: false }));
  }
});

potsAPIRouter.post("/updateNewArtData", async (req, res, next) => {
  try {
    console.log("/updateNewArtData called with params: ", req.body);
    let response = { success: false };

    if (!req.body.jsonCid) {
      response.message = "There is no jsonCid";
      res.send(JSON.stringify(response));
      return;
    }

    let doc = await nftSchema.findOne({ jsonCid: req.body.jsonCid }).exec();

    if (!doc) {
      response.message = "There is no doc with this jsonCid";
      res.send(JSON.stringify(response));
      return;
    }

    if ([NFT_STATUS.ONAUCTION, NFT_STATUS.SOLD].includes(doc.status)) {
      response.message = "You can not edit ongoing auction";
      res.send(JSON.stringify(response));
      return;
    }

    let isValid = utils.handleSignature(
      req.body.from,
      req.body.textToSign,
      req.body.signature
    );
    if (!isValid) {
      res.status(400).send(JSON.stringify("signature is not correct"));
      return;
    }

    let updateParams = {};
    if (req.body.reservePrice)
      updateParams.reservePrice = req.body.reservePrice;
    if (req.body.royality) updateParams.royality = req.body.royality;
    if (req.body.nftMarketAfterFirstSale)
      updateParams.nftMarketAfterFirstSale = getNftMarketAfterFirstSale(
        req.body.nftMarketAfterFirstSale
      );

    doc = await nftSchema.findOneAndUpdate(
      { jsonCid: req.body.jsonCid },
      updateParams,
      { new: true }
    );

    response = { success: true, doc: doc };
    res.send(JSON.stringify(response));
  } catch (e) {
    console.log("Something went wrong in updateNewArtData:", e);
    res.send(JSON.stringify({ success: false }));
  }
});

potsAPIRouter.post("/toggleNftListing", async (req, res, next) => {
  try {
    console.log("/toggleNftListing called with params: ", req.body);

    console.log("req.session.random", req.session.random);

    let response = { success: false };

    if (!req.body.jsonCid) {
      response.message = "There is no jsonCid";
      res.send(JSON.stringify(response));
      return;
    }

    let doc = await nftSchema.findOne({ jsonCid: req.body.jsonCid }).exec();

    if (!doc) {
      response.message = "There is no doc with this jsonCid";
      res.send(JSON.stringify(response));
      return;
    }

    if ([NFT_STATUS.ONAUCTION, NFT_STATUS.SOLD].includes(doc.status)) {
      response.message = "You can not edit ongoing auction";
      res.send(JSON.stringify(response));
      return;
    }

    let isValid = utils.handleSignature(
      req.body.from,
      req.body.textToSign,
      req.body.signature
    );
    if (!isValid) {
      res.status(400).send(JSON.stringify("signature is not correct"));
      return;
    }

    let updateParams = {};
    let status =
      doc.status === NFT_STATUS.NOTLISTED
        ? NFT_STATUS.LISTED
        : NFT_STATUS.NOTLISTED;

    doc = await nftSchema.findOneAndUpdate(
      { jsonCid: req.body.jsonCid },
      { status: status },
      { new: true }
    );

    response = { success: true, doc: doc };
    res.send(JSON.stringify(response));
  } catch (e) {
    console.log("Something went wrong in updateNewArtData:", e);
    res.send(JSON.stringify({ success: false }));
  }
});

module.exports = potsAPIRouter;
