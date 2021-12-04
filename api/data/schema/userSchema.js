var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  userEthAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  fName: {
    type: String,
    required: true,
    trim: true,
  },
  lName: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  tel: {
    type: String,
    default: "",
    trim: true,
  },
  twitterId: {
    type: String,
    default: "",
    trim: true,
  },
  instagramId: {
    type: String,
    default: "",
    trim: true,
  },
  receiveNews: {
    type: String,
    default: false,
    trim: true,
  },
  accountCreationDate: {
    type: Date,
  },
  lastSeen: {
    type: Date,
    required: false,
    default: null,
  },
  profilePhoto:{
    data: Buffer,
    contentType: String
  }
});

userSchema.statics.saveGeneralInfo = function (email, callback) {};

module.exports = mongoose.model("ABCuser", userSchema);
