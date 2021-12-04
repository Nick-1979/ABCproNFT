const ethers = require("ethers");
const myUtils  = require("../general");

const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK;
const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
  process.env.REACT_APP_CONTRACTS_ADDRESSES.split(",");

let ABI = require("./marketAbi.json");

module.exports = {
  async startMarketListener() {
    console.log("startMarketListener at client side");
    const PROVIDER = new ethers.providers.CloudflareProvider("Rinkeby");
    console.log("PROVIDER", PROVIDER);

    /**Just in developement to see if the connection to the blockchain exist.  */
    PROVIDER.on("block", (blockNumber) => {
      console.log(
        `The blockkkkkkkkk ${blockNumber} is mined.`.yellow.bgRed.bold
      );
    });
  },
  async getTxParamsToPlaceBid(
    _tokenIPFSPath,
    _tokenCreatorAddress,
    _reservePrice,
    _bidderAddress,
    _bid,
    _auctionId,
    _provider
  ) {
    if (_bid < _reservePrice) {
      console.log("bid is less than reserve price");
      return { success: false, text:'bid is less than reserve price'};
    }

    let bidInWei = ethers.utils.parseUnits(_bid, 18);
    let iface = new ethers.utils.Interface(ABI);
    // let contract = new ethers.Contract(ABCNFTMARKET_ADDRESS, ABI, _provider);
    let encodedABI;

    if (!_auctionId) {
      // Then mint and place first bid
      console.log("going to mint and place first bid");
      let reservePriceInWei = ethers.utils.parseUnits(
        _reservePrice.toString(),
        18
      );

      // try {
      //   /**checking the contract revert call error first */
      //   let estimatedGas = await contract.estimateGas.MintForAndplaceFirstBidOnABC(_tokenIPFSPath,
      //     _tokenCreatorAddress,
      //     reservePriceInWei,
      //     ABCNFT721_ADDRESS);
      //   console.log("estimatedGas: " + estimatedGas);
      // } catch (e) {
      //   console.log("gasEstimate error:",e);
      //   return { success: false, txParams: null, error: e.error.message };
      // }

      encodedABI = iface.encodeFunctionData("MintForAndplaceFirstBidOnABC", [
        _tokenIPFSPath,
        _tokenCreatorAddress,
        reservePriceInWei,
        ABCNFT721_ADDRESS,
      ]);
    } else {
      //It is already minted just place a bid
      console.log("already minted just place a bid. _auctionId: ", _auctionId);

      // try {
      //   /**checking the contract revert call error first */
      //   let estimatedGas = await contract.estimateGas.placeBid(_auctionId);
      //   console.log("estimatedGas: " + estimatedGas);
      // } catch (e) {
      //   console.log("gasEstimate error:",e);
      //   return { success: false, txParams: null, error: e.error.message };
      // }

      encodedABI = iface.encodeFunctionData("placeBid", [_auctionId]);
    }

    let txParams = {
      to: ABCNFTMARKET_ADDRESS,
      from: _bidderAddress,
      data: encodedABI,
      value: ethers.utils.hexlify(bidInWei),
    };

    return { success: true, txParams: txParams };
  },

  getInfoFromReceipt(_logs) {
    let result = {};
    let logId = "";

    let iface = new ethers.utils.Interface(ABI);

    let filter = ethers.utils.id("Minted(address,uint256,string,string)");
    let data = _logs.find((log) => log.topics.includes(filter));
    if (data) {
      result["tokenId"] = Number(data.topics[2]);
      logId += "Minted";
    }

    filter = ethers.utils.id(
      "ReserveAuctionBidPlaced(uint256,address,uint256,uint256)"
    );
    //**ReserveAuctionBidPlaced(*auctionId, *bidder, amount, endTime)*/
    data = _logs.find((log) => log.topics.includes(filter));
    if (data) {
      let parsedLog = iface.parseLog(data);

      result["endTime"] = Number(parsedLog.args.endTime);
      result["auctionId"] = Number(parsedLog.args.auctionId);
      result["amount"] = parsedLog.args.amount; //will change from wei to ether at server
      logId += "ReserveAuctionBidPlaced";
    }

    filter = ethers.utils.id(
      "ReserveAuctionFinalized(uint256,address,address,uint256,uint256,uint256)"
    );
    data = _logs.find((log) => log.topics.includes(filter));
    if (data) {
      logId = "ReserveAuctionFinalized";
      let parsedLog = iface.parseLog(data);

      result["auctionId"] = Number(parsedLog.args.auctionId);
      result["seller"] = parsedLog.args.seller;
      result["bidder"] = parsedLog.args.bidder;
    }

    return { receiptInfo: result, logId: logId };
  },

  async getMinBidAmount(_auctionId, _provider) {
    try {
      console.log(
        "getMinBidAmount, provider is ",
        _provider,
        " _auctionId is:",
        _auctionId
      );

      if (!_auctionId || !_provider) return 0;

      let contract = new ethers.Contract(ABCNFTMARKET_ADDRESS, ABI, _provider);
      let minBidAmount = await contract.getMinBidAmount(_auctionId);
      minBidAmount = ethers.utils.formatEther(minBidAmount);

      if (minBidAmount) return minBidAmount;
      else return 0;
    } catch (e) {
      console.log("Network not supported");
      return 0;
    }
  },

  async getReserveAuctionConfig(_provider) {
    try {
      let contract = new ethers.Contract(ABCNFTMARKET_ADDRESS, ABI, _provider);
      let { duration } = await contract.getReserveAuctionConfig();
      let durationInHour = Number(duration) / 3600;
      console.log("getReserveAuctionConfig:", durationInHour);

      return durationInHour;
    } catch (e) {
      console.log("Something went wrong, probably network not supported");
      return 24;
    }
  },

  finalizeReserveAuction(_auctionId, _settler) {
    console.log("finalizeReserveAuction, auctionId is:", _auctionId);

    if (!_auctionId) return { success: false };

    let iface = new ethers.utils.Interface(ABI);
    let encodedABI = iface.encodeFunctionData("finalizeReserveAuction", [
      _auctionId,
    ]);

    let txParams = {
      to: ABCNFTMARKET_ADDRESS,
      from: _settler,
      data: encodedABI,
    };

    return { success: true, txParams: txParams };
  },

  convertBidstoEth(_bids) {
    return _bids.map((bid) => {
      bid.amount = ethers.utils.formatEther(bid.amount);
      return bid;
    });
  },

  async toDatabase(_action, _params) {
    if (!_action) {
      console.log("toDatabase called but _action is empty!");
      return;
    }
    let result = await myUtils.postData(_action, _params);
    return result;
    //   let res = await fetch(
    //     process.env.REACT_APP_LOCAL_SERVER + "posts/" + _action,
    //     {
    //       method: "POST",
    //       body: JSON.stringify(_params),
    //       headers: {
    //         "Content-type": "application/json; charset=UTF-8",
    //       },
    //     }
    //   );
    //   if (res.status === 200) {
    //     return await res.json();
    //   }
    //   return null;
  },
};
