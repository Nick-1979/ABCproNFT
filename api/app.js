var createError = require("http-errors");
var express = require("express");
// const compression = require('compression');
var path = require("path");
const robots = require("express-robots-txt");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose"),
  https = require("https"),
  http = require("http"),
  session = require("express-session");

global.onAuctionTimers = []; //this is a global array
global.AUCTION_STATUS = {
  ONAUCTION: 0,
  SOLD: 1,
  SETTLED: 2,
  CANCELED: 3,
};
Object.freeze(AUCTION_STATUS);

global.NFT_STATUS = {
  ONAUCTION: 0,
  SOLD: 1,
  SETTLED: 2,
  CANCELED: 3, 
  NOTLISTED:4,
  LISTED: 5,
};

Object.freeze(NFT_STATUS);

global.NFT_MARKETS = {
  ABCPRO: 0,
  OPENSEA: 1,
};

Object.freeze(NFT_MARKETS);

mongoose.Promise = require("bluebird");

var app = express();

// const shouldCompress = (req, res) => {
//   if (req.headers['x-no-compression']) {
//     // Will not compress responses, if this header is present
//     return false;
//   }
//   // Resort to standard compression
//   return compression.filter(req, res);
// };
// /**
//  *  Compress all HTTP responses
//  */

// app.use(compression({
//   // filter: Decide if the answer should be compressed or not,
//   // depending on the 'shouldCompress' function above
//   filter: shouldCompress,
//   // threshold: It is the byte threshold for the response
//   // body size before considering compression, the default is 1 kB
//   threshold: 0
// }));

app.use(robots(__dirname + "/robots.txt"));

// var MongoStore = require('connect-mongo')(session);
var MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore(
  {
    uri: process.env.DATABASE_SERVER + process.env.DB_NAME,
    collection: "mySessions",
  },
  function (error) {
    // Should have gotten an error
    if (error) console.log("error in session Store: ", error);
  }
);
store.on("error", function (error) {
  // Also get an error here
  console.log("error in session onError: ", error);
});

//connect to MongoDB
mongoose.connect(process.env.DATABASE_SERVER + process.env.DB_NAME, {
  //  useMongoClient: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
var db = mongoose.connection;
db.on("error", (e)=>{
  console.log("DB connection error:",e)
  process.exit(0)
}
);
db.once("open", function () {
  console.log("database are connected successfully!");
});

app.use(
  session({
    secret: "mySecretISverySECRET",
    cookie: {
      maxAge: 1000 * 60 * 60 * process.env.COOKIE_LIFETIME, // hours
      secure: true,
      sameSite: "lax",
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

var indexRouter = require("./routes/index");
var getsAPIRouter = require("./routes/gets");
var postsAPIRouter = require("./routes/posts");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/gets", getsAPIRouter);
app.use("/posts", postsAPIRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
