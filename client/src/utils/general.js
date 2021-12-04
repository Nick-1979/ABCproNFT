var ethUtil = require("ethereumjs-util");
const { ethers } = require("ethers");
const Globals = require("./globals");

const API_SERVER =
  window.location.protocol +
  "//" +
  window.location.hostname +
  ":" +
  process.env.REACT_APP_API_SERVER_PORT;

module.exports = {
  async profileLink(_userAddress) {
    let userProfile = await module.exports.getUserProfile(_userAddress);
    let tail;
    if (!userProfile) {
      console.log(" profile link gets no userProfilef");
      tail = _userAddress;
    } else {
      tail = userProfile.userId ? userProfile.userId : _userAddress;
    }
    return (
      window.location.protocol +
      "//" +
      window.location.hostname +
      "/profile/" +
      tail
    );
  },

  convertChainIdToName(chainId) {
    switch (chainId) {
      case "0x1":
        return "Mainnet";
      case "0x3":
        return "Ropsten";
      case "0x4":
        return "Rinkeby";
      case "0x5":
        return "Goerli";
      case "0x2a":
        return "Kovan";
      default:
        return null;
    }
  },

  showArtPage(data) {
    window.open(
      window.location.protocol +
        "//" +
        window.location.hostname +
        "/gallery/" +
        data.jsonCid,
      "_self"
    );
  },

  async signByMetamask(_dataToSign) {
    console.log("Signing a data via Metamask ");
    const from = window.ethereum.selectedAddress;
    if (!from || !_dataToSign) return null;

    const msg = ethUtil.bufferToHex(Buffer.from(_dataToSign), "utf8");
    const params = [msg, from];

    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: params,
    });

    return signature;
  },

  async getUserProfile(_address_userId) {
    if (!_address_userId) {
      console.log("in getUserProfile _address_userId is null");
      return null;
    }
    let data = {};
    if (_address_userId.includes("@")) {
      data.userId = _address_userId;
    } else if (
      _address_userId.startsWith("0x") ||
      _address_userId.startsWith("0X")
    ) {
      data.userEthAddress = _address_userId;
    }

    if (Object.keys(_address_userId).length) {
      let result = await module.exports.postData("userInfo", data);

      if (result.success) {
        console.log("userinfo result is ", result, data);
        return result.userInfo;
      }
    } else {
      console.log(
        "_address_userId in getUserProfile is null ",
        _address_userId
      );
      return null;
    }
  },

  toChecksumAddress(_address) {
    return ethers.utils.getAddress(_address);
  },

  hashOf(_data) {
    return ethers.utils.id(_data);
  },

  /**
   *
   * @param {string} path the request path which will be append at the end of  the URL
   * @param {json} data will be send to server
   * @returns json response
   */
  async postData(path = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(API_SERVER + "/posts/" + path, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    if (!response.ok) {
      console.log(`Somthing went wrong while ${path} data was ${data}`);
      return null;
    }
    return response.json(); // parses JSON response into native JavaScript objects
  },

  getHighestBid(item) {
    if (item.nft.transfers.length) {
      let lastTransfer = item.nft.transfers[item.nft.transfers.length - 1];
      return lastTransfer.price;
    }
    return item.auction
      ? item.auction.bids[item.auction.bids.length - 1].amount
      : 0;
  },

  prepareCardLabels(item) {
    if (!item) {
      console.log("There is no item to prepare card label");
      return;
    }
    if (item.nft.transfers.length) {
      return "sell in OpenSea";

    }
    switch (item.nft.status) {
      case Globals.default.NFT_STATUS.NOTLISTED:
        return "Not listed";
      case Globals.default.NFT_STATUS.LISTED:
        return "For sale";
      case Globals.default.NFT_STATUS.ONAUCTION:
        return "In auction";
      case Globals.default.NFT_STATUS.SOLD:
        return "Sold";
      case Globals.default.NFT_STATUS.SETTLED:
        return "Auction settled";
      case Globals.default.NFT_STATUS.CANCELED:
        return "Cancelld";
      default:
        return "Unknown";
    }
  },
};
