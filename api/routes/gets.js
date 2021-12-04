var express = require("express");
var getsAPIRouter = express.Router();
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
const pinata = require("../utils/ipfs");
const NFTSchema = require("../data/schema/nftSchema");
const userSchema = require("../data/schema/userSchema");


module.exports = getsAPIRouter;
