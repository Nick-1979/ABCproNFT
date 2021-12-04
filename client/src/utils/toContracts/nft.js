const ethers = require("ethers");

const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK;
const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
  process.env.REACT_APP_CONTRACTS_ADDRESSES.split(",");

let ABI = require("./nftAbi.json");

module.exports = {
  async ownerOf(_tokenId, _provider) {
    try {
      let contract = new ethers.Contract(ABCNFT721_ADDRESS, ABI, _provider);
      let owner = await contract.ownerOf(_tokenId);
      console.log(`The owner of tokenId ${_tokenId} is ${owner}`);
      if (owner && owner.toLowerCase()!== ABCNFTMARKET_ADDRESS.toLowerCase()) return owner;
      return null;
    } catch {
      return null;
    }
  },
};
