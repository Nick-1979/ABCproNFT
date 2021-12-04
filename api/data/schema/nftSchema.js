var mongoose = require("mongoose");
const BigNumber = require("bignumber.js");
const BigNumberSchema = require("mongoose-bignumber");

var nftSchema = new mongoose.Schema({
  jsonCid: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  artCid: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  userEthAddress: { //this is artist Eth Address
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: String,
    trim: true,
  },
  artistName: {
    type: String,
    required: true,
    trim: true,
  },
  artName: {
    type: String,
    required: true,
    trim: true,
  },
  fileType: {
    type: String,
    required: true,
    trim: true,
  },
  reservePrice: {
    type: String,
    default: 0,
    trim: true,
  },
  royality: {
    type: Number, //in percent, between 0 and 99
    default: 0,
  },

  likes: {
    type: Array, //an array contains all addresses who likes this NFT
    default: [],
  },
  status: {
    type: Number,
    default: 0,
  },

  creationDate: {
    type: Date,
  },
  auctionId: {  // thi is the last auction Id
    type: String,
  },
  tokenId: {
    type: String,
  },
  description: {
    type: String,
  },
  transfers:{
    type: Array, //[seller,buyer,price,date]
    default: [],
  },
  nftMarketAfterFirstSale: {
    type: Number,
    default: 0,
  },
});

nftSchema.statics.saveGeneralInfo = function (
  email,
  oldPass,
  newPass,
  callback
) {};

module.exports = mongoose.model("nft", nftSchema);
