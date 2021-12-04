"use strict";

require("dotenv").config();
const Web3 = require("web3");
const web3 = new Web3("");

const { ethers, upgrades } = require("hardhat");
const _ = require("lodash");
const marketSchema = require("../data/schema/marketSchema");
const nftSchema = require("../data/schema/nftSchema");
// const { getOwnerOf } = require("./contracts");
const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
  process.env.CONTRACTS_ADDRESSES.split(",");

const DEFAULT_NETWORK = process.env.DEFAULT_NETWORK;
const PROVIDER = new ethers.providers.getDefaultProvider(DEFAULT_NETWORK, [
  "cloudflare",
]);

const isAuctionFinished = (_auctionEndTime) =>
  Date.now() > _auctionEndTime * 1000;

const areBidsEqual = (bid, newBid) =>
  bid.bidder.toLowerCase() === newBid.bidder.toLowerCase() &&
  bid.amount === ethers.utils.formatEther(newBid.amount);

const setTimerForAuctionStatusToChangeToSold = (
  _newTime,
  _oldTime,
  _auctionId
) => {
  // let timer = 0;
  if (_newTime > _oldTime) {
    let index = onAuctionTimers.findIndex(
      (item) => item.auctionId === _auctionId
    );

    if (index > -1) {
      clearTimeout(onAuctionTimers[index].timer);
      onAuctionTimers.splice(index, 1); //remove timer from array
    }

    let miniSecondsToFireTimeout = _newTime * 1000 - Date.now();
    console.log(
      `set a timer for auctionId ${_auctionId} at ${miniSecondsToFireTimeout}`
    );

    let timer = setTimeout(
      module.exports.auctionStatusUpdate,
      miniSecondsToFireTimeout,
      _auctionId,
      AUCTION_STATUS.SOLD
    );

    onAuctionTimers.push({ auctionId: _auctionId, timer: timer });
  }

  // return timer;
};

async function getOwnerOf(_tokenId) {
  try {
    if (!_tokenId || _tokenId < 1) {
      console.log(`tokenId ${_tokenId} is not correct in get OwnerOf`);
      return null;
    }
    const ABCNFT721 = await ethers.getContractFactory("ABCNFT721");
    let abi = ABCNFT721.interface;
    let contract = new ethers.Contract(ABCNFT721_ADDRESS, abi, PROVIDER);
    let owner = await contract.ownerOf(_tokenId);

    return owner;
  } catch (err) {
    let text = "Somthing went wrong while get OwnerOf";
    console.log(text + err);
    return null;
  }
}

module.exports = {
  async updateBids(_auctionId, _newBid, _endTime) {
    console.log(
      `updating bids with auctionId:${_auctionId} with a new bid:`,
      _newBid
    );
    try {
      let updatedBid = [];
      let timer;

      let doc = await marketSchema
        .findOne({
          auctionId: _auctionId,
        })
        .exec();

      if (!doc) {
        //this usually happens when receive event from blockchain sooner than client side
        console.log(
          "there is no doc to be updated!!! hence create a new auction thoug"
        );

        doc = await marketSchema.create({
          auctionId: _auctionId,
          bids: [
            {
              bidder: _newBid.bidder,
              amount: ethers.utils.formatEther(_newBid.amount),
              date: Date.now(),
            },
          ],
          endTime: _endTime,
        });

        setTimerForAuctionStatusToChangeToSold(
          _endTime,
          0, //send zero as _oldTime, cause we creating (not updating) an auction by a bid
          doc.auctionId
        );
        // onAuctionTimers.push({ auctionId: _auctionId, timer: timer });

        return {
          success: true,
          message: "there was no doc to be updated hence created one",
          updatedDoc: doc,
        };
      }

      //check if newBid is biger than others
      if (doc.bids.length) {
        let anyHigherBid = doc.bids.find(
          (item) =>
            Number(item.bid) >= Number(ethers.utils.formatEther(_newBid.amount))
          //TODO should use formatether????????????????????????????
        );
        if (anyHigherBid) {
          // todo ??????????????????????????????????????????????????
          res.send(
            JSON.stringify({
              success: false,
              message: "A new bid Must be higher than other bids.",
            })
          );
          return;
        }
      }

      //check if the bid is already exist
      let alreadyExistedBid = doc.bids.find((bid) =>
        areBidsEqual(bid, _newBid)
      );

      if (alreadyExistedBid) {
        if (!alreadyExistedBid.txHash) {
          //note: auctions coming from client has txHash, but those come from blockchain logs does not
          let indexOfAlreadyExistedBid = doc.bids.findIndex((bid) =>
            areBidsEqual(bid, _newBid)
          );

          doc.bids[indexOfAlreadyExistedBid]["txHash"] = _newBid.txHash;
          updatedBid = doc.bids;
        }
      } else {
        //add new bid
        //change some fields accordingly first
        _newBid["amount"] = ethers.utils.formatEther(_newBid.amount);
        _newBid["date"] = Date.now();

        if (doc.bids.length) updatedBid = [...doc.bids];
        updatedBid.push(_newBid);
      }

      if (!updatedBid.length) {
        console.log("message: already existed");
        return {
          success: true,
          message: "already existed",
          updatedDoc: doc,
        };
      }

      setTimerForAuctionStatusToChangeToSold(
        _endTime,
        doc.endTime,
        doc.auctionId
      );
      // onAuctionTimers.push({ auctionId: _auctionId, timer: timer });

      doc = await marketSchema.findOneAndUpdate(
        { auctionId: _auctionId },
        { bids: [...updatedBid], endTime: _endTime },
        { new: true }
      );
      console.log("updated doc is ", doc);

      return {
        success: true,
        message: "auction/txHash updated",
        updatedDoc: doc,
      };
    } catch (e) {
      console.log("error while set a new bid:", e);
      return { success: false, message: e, updatedDoc: null };
    }
  },

  /**
   *
   * @param {*} _auctionId
   * @param {*} _status
   * @returns
   */
  async auctionStatusUpdate(_auctionId, _status) {
    console.trace('Trace of "auctionStatusUpdate"');
    //TODO: check if there is extension before updating status
    let doc = await marketSchema.findOneAndUpdate(
      { auctionId: _auctionId },
      { status: _status },
      { new: true }
    );
    doc = await nftSchema.findOneAndUpdate(
      { auctionId: _auctionId },
      { status: _status },
      { new: true }
    );
    console.log(`Auction #${_auctionId} statuse changed to ${_status}`);
    return doc.status === _status;
  },

  /**
   * @dev creates a new auction in marketSchema then updates auctionId in nftSchema
   * @param {*} _newAuction
   * @param {*} _jsonCid , needs to find corresponding nft in nftSchema to update its auctionId
   * @returns  success as boolean,and updated auction
   */
  async createNewAuctionAndUpdateNftSchema(_newAuction, _jsonCid) {
    console.trace("Trace of 'createNewAuctionAndUpdateNftSchema'", _newAuction);
    try {
      let auction = await marketSchema.findOneAndUpdate(
        { auctionId: _newAuction.auctionId },
        _newAuction,
        {
          new: true,
          upsert: true,
        }
      );

      console.log("a new auction is created:%o", auction);

      /**update auctionId and tokenId in nftSchema*/
      await nftSchema.findOneAndUpdate(
        { jsonCid: _jsonCid },
        {
          auctionId: _newAuction.auctionId,
          tokenId: _newAuction.tokenId,
          status: NFT_STATUS.ONAUCTION,
        }
      );

      return {
        success: true,
        auction: auction,
      };
    } catch (e) {
      console.log("error while createNewAuctionAndUpdateNftSchema", e);
      return {
        success: false,
      };
    }
  },

  async auctionFinalized(_auctionId, _settler, _settlementHash) {
    try {
      let updatedDoc = await marketSchema.findOneAndUpdate(
        { auctionId: _auctionId },
        {
          status: AUCTION_STATUS.SETTLED,
          settlement: {
            settler: _settler,
            settlementHash: _settlementHash,
            date: Date.now(),
          },
        },
        { new: true }
      );
      let bidsCount = updatedDoc.bids.length;
      let owner = updatedDoc.bids[bidsCount - 1].bidder;
      await nftSchema.findOneAndUpdate(
        { auctionId: _auctionId },
        { status: NFT_STATUS.SETTLED, owner: owner }
      );
      console.log(`Auction #${_auctionId} is finalized`);
      return { success: true, updatedDoc: updatedDoc };
    } catch (e) {
      console.log(`Something went wrong in auctionFinalized, Error `, e);
      return { success: false, updatedDoc: null };
    }
  },

  async updateTransfers(
    _transactionHash,
    _tokenId,
    _seller,
    _buyer,
    _price = 0
  ) {
    console.log("updateTransfers", _tokenId);
    try {
      let doc = await nftSchema.findOne({ tokenId: _tokenId }).exec();
      if (doc.length === 0) {
        console.log("there is no doc to update transferes, tokenId:", _tokenId);
        return;
      }
      let transfers = doc.transfers;
      transfers.push({
        seller: _seller,
        buyer: _buyer,
        price: _price,
        txHash: _transactionHash,
        date: Date.now(),
      });

      await nftSchema.findOneAndUpdate(
        { tokenId: _tokenId },
        {
          transfers: transfers,
          owner: _buyer,
        }
      );

      return {
        success: true,
      };
    } catch (e) {
      console.log("error while updateTransfers", e);
      return {
        success: false,
      };
    }
  },

  handleSignature(_signer, _textToSign, _signature) {
    if (!_signer || !_textToSign || !_signature) {
      console.error("handleSignature parameters are not correct");
      return false;
    }

    console.log(
      `checking sinature for: _signer:${_signer} _textToSign:${_textToSign} _signature:${_signature}`
    );

    const signingAddress = web3.eth.accounts.recover(
      _textToSign.toString(),
      _signature
    );

    console.log("signingAddress: ", signingAddress);
    if (signingAddress.toLowerCase() !== _signer.toLowerCase()) {
      console.error("signature is not correct");
      return false;
    }
    return true;
  },

  async updateStatusWithEndTimeAfterServerRestart(_auction, _endTime) {
    try {
      let newStatus;
      if (!_endTime) {
        console.log(
          "there is no endTime in updateStatusWithEndTimeAfterServerRestart"
        );
        process.exit(0);
        return;
      }
      //auction not finalized yet
      newStatus = isAuctionFinished(_endTime)
        ? AUCTION_STATUS.SOLD
        : AUCTION_STATUS.ONAUCTION;

      if (newStatus === AUCTION_STATUS.ONAUCTION) {
        setTimerForAuctionStatusToChangeToSold(
          _endTime,
          0, //send zero as _oldTime, to force setTimeOut.
          _auction.auctionId
        );
      }

      if (newStatus == _auction.status) {
        console.log(
          ` auctionId: ${_auction.auctionId} status is ok (${_auction.status})`
        );
        return;
      }

      console.log(
        `auctionId: ${_auction.auctionId} status are changing from ${_auction.status} to ${newStatus}`
      );

      await marketSchema.findOneAndUpdate(
        { auctionId: _auction.auctionId },
        { status: newStatus },
        { new: true }
      );

      await nftSchema.findOneAndUpdate(
        { auctionId: _auction.auctionId },
        { status: newStatus }
      );
    } catch (e) {
      console.log(
        `error in updateStatusWithEndTimeAfterServerRestart. Error:`,
        e
      );
      process.exit(0);
    }
  },

  async updateStatusWithoutEndTimeAfterServerRestart(_auction) {
    try {
      let newStatus;
      let ownerInDatabase = await await marketSchema
        .findOne({ auctionId: _auction.auctionId })
        .exec();
      let ownerOnBlockchain = await getOwnerOf(_auction.tokenId);

      if (!ownerOnBlockchain) {
        console.log(`auctionId:${_auction.auctionId} is cancelled`);
        newStatus = AUCTION_STATUS.CANCELED;
      } else {
        ownerInDatabase = ownerInDatabase ? ownerInDatabase : "0x";

        if (ownerInDatabase.toLowerCase() == ownerOnBlockchain.toLowerCase()) {
          console.log(
            `auctionId:${_auction.auctionId} statuse is ok(${_auction.auctionId})`
          );
          return;
        }

        newStatus = AUCTION_STATUS.SETTLED;
      }

      console.log(
        `auctionId: ${_auction.auctionId} status are changing from ${_auction.status} to ${newStatus}`
      );

      await marketSchema.findOneAndUpdate(
        { auctionId: _auction.auctionId },
        { status: newStatus }
      );

      await nftSchema.findOneAndUpdate(
        { auctionId: _auction.auctionId },
        { status: newStatus }
      );
    } catch (e) {
      console.log(
        `error in updateStatusWithoutEndTimeAfterServerRestart. Error:`,
        e
      );
      process.exit(0);
    }
  },
};
