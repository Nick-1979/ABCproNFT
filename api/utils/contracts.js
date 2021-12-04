"use strict";
const colors = require("colors");

const { ethers, upgrades } = require("hardhat");
require("dotenv").config();
const marketSchema = require("../data/schema/marketSchema");
const nftSchema = require("../data/schema/nftSchema");

const utils = require("./general");

const WyvernExchangeABI = require("./openseaContracts/WyvernExchange.json");

colors.setTheme({
  info: "bgGreen",
  help: "cyan",
  warn: "yellow",
  success: "bgBlue",
  error: "red",
});

const {
  DEFAULT_NETWORK,
  ALCHEMY_KEY,
  ACCOUNT_PRIVATE_KEY,
  CONTRACTS_ADDRESSES,
  OPENSEA_CONTRACT_ADDRESS,
} = process.env;

const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
  CONTRACTS_ADDRESSES.split(",");

const PROVIDER = new ethers.providers.AlchemyProvider(
  DEFAULT_NETWORK,
  ALCHEMY_KEY
);

/**Just in developement to see if the connection to the blockchain exist.  */
PROVIDER.on("block", (blockNumber) => {
  console.log(`The block ${blockNumber} is mined.`.yellow.bgRed.bold);
});

let openseaIface = new ethers.utils.Interface(WyvernExchangeABI);
/**
 * handling transfers of tokens on OpenSea
 */
async function handleTransfer(_args, _transactionHash) {
  if (!_args || !_transactionHash) {
    console.log("there is no args to handleTransfer");
    return;
  }
  let receipt = await PROVIDER.getTransactionReceipt(_transactionHash);

  // the 3rd log is from opensea which contains the price of an nft transfer
  let [openSeaLogInReceipt] = receipt.logs.slice(-1);

  let openseaParsedLog = openseaIface.parseLog(openSeaLogInReceipt);

  let price = ethers.utils.formatEther(openseaParsedLog.args.price);

  utils.updateTransfers(
    _transactionHash,
    _args.tokenId,
    _args.from,
    _args.to,
    price
  );
}

module.exports = {
  async marketListener() {
    console.log("marketListener is listening on ", ABCNFTMARKET_ADDRESS);
    const ABCNFTMarket = await ethers.getContractFactory("ABCNFTMarket");
    let iface = ABCNFTMarket.interface;

    let filter = {
      address: ABCNFTMARKET_ADDRESS,
      topics: [],
    };
    PROVIDER.on(filter, (log, event) => {
      let parsedLog = iface.parseLog(log);
      this.handleMarketEvents(parsedLog.name, parsedLog.args);
    });
  },

  async handleMarketEvents(_eName, _eArgs) {
    switch (_eName) {
      case "ReserveAuctionCreated":
        this.handleReserveAuctionCreated(_eArgs);
        break;

      case "ReserveAuctionBidPlaced":
        this.handleReserveAuctionBidPlaced(_eArgs);
        break;

      case "ReserveAuctionFinalized":
        this.handleReserveAuctionFinalized(_eArgs);
        break;

      default:
        console.log("no code for this event !!", _eName);
    }
  },

  async nftListener() {
    console.log("nftListener is listening to ", ABCNFT721_ADDRESS);
    const ABCNFTMarket = await ethers.getContractFactory("ABCNFT721");
    let iface = ABCNFTMarket.interface;

    let filter = {
      address: ABCNFT721_ADDRESS,
      topics: [],
    };
    PROVIDER.on(filter, (log, event) => {
      console.log("ABCNFTMarket event log", log);
      let parsedLog = iface.parseLog(log);
      this.handleNftEvents(parsedLog.name, parsedLog.args, log.transactionHash);
    });
  },

  async handleNftEvents(_eName, _eArgs, _transactionHash) {
    switch (_eName) {
      case "Transfer":
        handleTransfer(_eArgs, _transactionHash);
        break;

      default:
        console.log("no code for this event in handleNftEvents !!", _eName);
    }
  },

  /**
     *  event ReserveAuctionCreated(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 duration,
        uint256 extensionDuration,
        uint256 reservePrice,
        uint256 auctionId
    );
     */
  async handleReserveAuctionCreated(_newAuction) {
    console.log(" handling ReserveAuctionCreated: ", _newAuction);

    if (!_newAuction) {
      console.log("can not create auction, _newAuction is empty", _newAuction);
      return;
    }

    let newAuction = {
      seller: _newAuction.seller,
      nftContract: _newAuction.nftContract,
      tokenId: _newAuction.tokenId,
      duration: _newAuction.duration,
      extensionDuration: _newAuction.extensionDuration,
      reservePrice: ethers.utils.formatEther(_newAuction.reservePrice),
      auctionId: _newAuction.auctionId,
      status: NFT_STATUS.ONAUCTION,
    };

    let jsonCid = await this.getTokenJsonCid(_newAuction.tokenId);

    if (!jsonCid) {
      console.log("failed to fetch jsonCid ..........");
      return;
    }
    let retVal = await utils.createNewAuctionAndUpdateNftSchema(
      newAuction,
      jsonCid
    );

    return retVal.success ? retVal.auction : null;
  },

  /**
   *   event ReserveAuctionBidPlaced( 
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 endTime
   */
  async handleReserveAuctionBidPlaced(_newBid) {
    console.log(" handling handleReserveAuctionBidPlaced: ", _newBid);
    if (!_newBid) {
      console.log("can not update auction, _newBid is empty", _newBid);
      return;
    }
    let newBid = {
      bidder: _newBid.bidder,
      amount: _newBid.amount,
      txHash: null,
    };
    let result = await utils.updateBids(
      String(_newBid.auctionId),
      newBid,
      _newBid.endTime
    );
    if (result.success) {
      console.log(
        `Auction with Id ${String(_newBid.auctionId)} is updated.`,
        result.updatedDoc
      );
    } else {
      console.log("There is no auction to update!!!!!!!!1", _newBid);
    }
    return result.success;
  },

  async handleReserveAuctionFinalized(_eArgs) {},

  async getAuctionEndTime(_auctionId) {
    try{
    console.log(`getting auction endTime for ${_auctionId}   `);
    //get from bloackchain because it might be extended
    const ABCNFTMarket = await ethers.getContractFactory("ABCNFTMarket");
    let abi = ABCNFTMarket.interface;
    let contract = new ethers.Contract(ABCNFTMARKET_ADDRESS, abi, PROVIDER);
    let reserveAuction = await contract.getReserveAuction(String(_auctionId));

    if (!reserveAuction) {
      console.log(
        "reserveAuction in getAuctionEndTime is empty:",
        reserveAuction
      );
      return null;
    }
    return Number(reserveAuction.endTime);
  }catch(e){
    console.log(`Something went wrong! Can not get auctions end time. Error:`,e);
    process.exit(0);
  }
  },

  async getTokenJsonCid(_tokenId) {
    const ABCNFT721 = await ethers.getContractFactory("ABCNFT721");
    let abi = ABCNFT721.interface;
    let contract = new ethers.Contract(ABCNFT721_ADDRESS, abi, PROVIDER);
    let uri = await contract.tokenURI(String(_tokenId));
    let baseUri = await contract.baseURI();

    // console.log(`The token uri for tokenID:${_tokenId} is ${uri}`)
    // console.log(`The base uri  is ${baseUri}`)
    let jsonCid = uri.replace(baseUri, "");

    return jsonCid;
  },

  // async getOwnerOf(_tokenId) {
  //   try {
  //     if (!_tokenId || _tokenId < 1) {
  //       console.log(`tokenId ${_tokenId} is not correct in get OwnerOf`);
  //       return null;
  //     }
  //     const ABCNFT721 = await ethers.getContractFactory("ABCNFT721");
  //     let abi = ABCNFT721.interface;
  //     let contract = new ethers.Contract(ABCNFT721_ADDRESS, abi, PROVIDER);
  //     let owner = await contract.ownerOf(_tokenId);

  //     return owner;
  //   } catch (err) {
  //     let text = "Somthing went wrong while get OwnerOf";
  //     console.log(text + err);
  //     return null;
  //   }
  // },
  
  async checkAndSetOwners() {
    try {
      let withoutOwnerNfts= await nftSchema.find({owner:''}).exec();
      console.log(`there are ${withoutOwnerNfts.length} Nfts without Owner `);

      const ABCNFT721 = await ethers.getContractFactory("ABCNFT721");
      let abi = ABCNFT721.interface;
      let contract = new ethers.Contract(ABCNFT721_ADDRESS, abi, PROVIDER);
      withoutOwnerNfts.map(async (nft)=>{
      // let totalSupply = await contract.totalSupply();
      // console.log("==ABCNFT721 Total Supply is : ", Number(totalSupply));
      // for (let i = 1; i <= Number(totalSupply); i++) {
        //get owner of each token then set it in local database
        console.log(`getting owner of token ${nft.tokenId}`);
        let owner = await contract.ownerOf(nft.tokenId);

        // console.log(`owner of token ${nft.tokenId} is ${owner}`);

        await nftSchema.findOneAndUpdate({ tokenId: nft.tokenId }, { owner: owner });
        console.log(`Owner of token ${nft.tokenId} is set to ${owner} `);
      })
      let text = "All owners are set successfully";
      console.log(text);
      return { succes: true, text: text };
    } catch (err) {
      let text = "Somthing went wrong while setting owners";
      console.log(text + err);
      process.exit(0)
      return { success: false, text: text };
    }
  },
};

module.exports.marketListener();

module.exports.nftListener();

// module.exports.getTokenJsonCid(36).then(console.log)
