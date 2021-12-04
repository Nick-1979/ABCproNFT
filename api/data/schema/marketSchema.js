var mongoose = require("mongoose");
const BigNumber = require("bignumber.js");
const BigNumberSchema = require("mongoose-bignumber");

var MarketSchema = new mongoose.Schema({
  auctionId: {
    type: String,
  },
  tokenId: {
    type: String,
  },
  seller: { type: String, trim: true },

  settlement: { //includes txHash, settler, date
    type: Array,
    default: [],
  },
  nftContract: { type: String, trim: true },

  reservePrice: {
    type: String,
  },
  bids: {
    type: Array,
    default: [],
  },
  duration: { type: String },
  extensionDuration: { type: String },
  endTime: {
    type: String,
    default: null,
  },

  status: {
    type: Number,
    default: 0,
  },
  soldPrice: {
    type: String,
    default: null,
  },
});

MarketSchema.statics.saveGeneralInfo = function (
  email,
  oldPass,
  newPass,
  callback
) {};

module.exports = mongoose.model("market", MarketSchema);
