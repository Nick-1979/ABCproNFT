import { useState, useEffect, useContext } from "react";
import WalletProfile from "../wallet/WalletProfile";
import ActionsButton from "./artPageActionsButton";
import Globals from "../../utils/globals";
import SessionContext from "../wallet/sessionContext";
import Moment from "jalali-moment";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import {
  HourglassFullRounded as HourglassFullRoundedIcon,
  PlaylistAddCheckRounded as PlaylistAddCheckRoundedIcon,
  PlaylistAddRounded as PlaylistAddRoundedIcon,
  EditOutlined as EditOutlinedIcon,
  ShoppingBasket as ShoppingBasketIcon,
  OpenInNewTwoTone as OpenInNewTwoToneIcon,
  VisibilityRounded as VisibilityRoundedIcon,
} from "@mui/icons-material";
import { green, grey, blue } from "@mui/material/colors";
import myUtils from "../../utils/general";
import { Route } from "react-router-dom";
import { getUserProfile } from "../../utils/general";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { makeStyles } from "@mui/styles";

import StyledButton from "./styledButton";

import {
  Tooltip,
  Container,
  Box,
  Button,
  LinearProgress,
  Hidden,
  Fab,
  Accordion,
  AccordionSummary,
  FormControl,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Radio,
  FormHelperText,
  Link,
  Paper,
  Backdrop,
  CircularProgress,
  Avatar,
  InputAdornment,
  TextField,
  Modal,
  Typography,
  Grid,
  CardMedia,
  Divider,
  Card,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Eth } from "@rimble/icons"; ///   cryptocurrency-icons
import Market from "../../utils/toContracts/market";
import Nft from "../../utils/toContracts/nft";

/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";
import { StylesProvider } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */

const [, , ABCNFT721_ADDRESS] =
  process.env.REACT_APP_CONTRACTS_ADDRESSES.split(",");
const useStyles = makeStyles((theme) => ({
  colorTest: {
    backgroundColor: "pink",
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 0, 2),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  detailsGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    backgroundColor: "white",
  },
  divider: {
    backgroundColor: "white",
  },
  bidInfo: {
    // paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(2),
    backgroundColor: "white",
    fontSize: 12,
  },
  card: {
    maxWidth: 444,
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    marginTop: "1",
    marginBottom: "1",
    alignItems: "center",
  },
  cardMedia: {
    // paddingTop: "2%",
    height: "100%",
    width: "100%",
  },
  logo: {
    marginTop: "6%",
    height: 26,
    width: 64,
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  extendedIcon: {
    margin: theme.spacing(1),
  },

  extendedIconLeft: {
    marginLeft: theme.spacing(1),
  },
  extendedIconRight: {
    marginRight: theme.spacing(1),
  },

  paper: {
    position: "absolute",
    maxWidth: 600,
    minWidth: 300,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const useStylesBlackTooltip = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: theme.typography.pxToRem(14),
  },
}));

function BlackTooltip(props) {
  const classes = useStylesBlackTooltip();

  return <Tooltip arrow classes={classes} {...props} />;
}

function getModalStyle() {
  const width = window.screen.width / 2;
  const height = window.screen.height / 2;
  const top = 50; // (window.screen.height - (height/100)*window.screen.height) / 2;
  const left = 50; //(window.screen.width -( width/100)*window.screen.width) / 2;
  console.log("height:", height);

  console.log("top:", top);
  return {
    top: `${50}%`,
    left: `${50}%`,
    // width: `${width}`,
    // height: `${height}`,

    transform: `translate(-${top}%, -${left}%)`,
  };
}

const changeUrlToProfilePage = (_address) => {
  if (!_address) return;
  return (
    <Route render={({ history }) => history.push("/profile/" + _address)} />
  );
};

export default function ArtPage(props) {
  const [state, setState] = useState("anArtPage");
  const [userAddress, setUserAddress] = useState(null);

  const showUserProfile = (data) => {
    if (!data) return;
    setUserAddress(data.userEthAddress);
    setState("userProfile");
  };

  return (
    <div>
      {state === "anArtPage" && <AnArtPage showUserProfile={showUserProfile} />}

      {state === "userProfile" && changeUrlToProfilePage(userAddress)}
    </div>
  );
}

export function AnArtPage(props) {
  const session = useContext(SessionContext);

  const UpdateArtDataSteps = ["Edit", "Confirm", "done"];
  const [updateArtDataActiveStep, setUpdateArtDataActiveStep] = useState(0);

  const placeABidSteps = ["Input", "Confirm", "Done "];
  const [placeABidActiveStep, setPlaceABidActiveStep] = useState(0);

  const [fileType, setFileType] = useState("img");
  const [nftData, setNftData] = useState(null);
  const [auctionData, setAuctionData] = useState();
  const [nftTransfers, setNftTransfers] = useState(null);

  const [editPriceModalOpen, setEditPriceModalOpen] = useState(false);
  const [placeABidModalOpen, setPlaceABidModalOpen] = useState(false);
  const [continueInWallet, setContinueInWallet] = useState(false);
  const [waitForTransactionConfirm, setWaitForTransactionConfirm] =
    useState(false);
  const [reservePrice, setReservePrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [receipt, setReceipt] = useState();
  const [nonce, setNonce] = useState();

  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [imageUrlOnIPFS, setImageUrlOnIPFS] = useState();

  const [allBids, setAllBids] = useState([]);
  const [minBidAmount, setMinBidAmount] = useState();
  const [maxBidAmount, setMaxBidAmount] = useState();
  const [newBid, setNewBid] = useState();
  const [maxBidder, setMaxBidder] = useState();
  const [endTime, setEndTime] = useState();
  const [placeABidButtonDisabled, setPlaceABidButtonDisabled] = useState(false);

  const [txHash, setTxHash] = useState();
  const [profilePhoto, setProfilePhoto] = useState("/images/unknown.jpg");

  const [auctionId, setAuctionId] = useState();
  const [auctionDuration, setAuctionDuration] = useState(24);
  const [auctionTimer, setAuctionTimer] = useState();
  const [timer, setTimer] = useState(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [auctionSettlement, setAuctionSettlement] = useState();

  const [newReservePrice, setNewReservePrice] = useState(null);
  const [newRoyality, setNewRoyality] = useState(null);
  const [newNftMarketAfterFirstSale, setNewNftMarketAfterFirstSale] =
    useState();

  const [notListed, setNotListed] = useState(true);

  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const [onViewsBgColor, setOnViewsBgColor] = useState([]);

  const [owner, setOwner] = useState(null);
  const [ownerLink, setOwnerLink] = useState(null);

  const [loading, setLoading] = useState(true);

  const handle = useFullScreenHandle();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const classes = useStyles();

  const UpdateArtDataStepperToNext = () => {
    setUpdateArtDataActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const resetUpdateArtDataStepper = () => {
    setUpdateArtDataActiveStep(0);
  };

  const placeABidStepperToNext = () => {
    setPlaceABidActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const resetPlaceABidStepper = () => {
    setPlaceABidActiveStep(0);
  };

  const handleImageLoaded = () => {
    //setOpenBackdrop(false);
    setLoading(false);
  };

  const handleEditPriceModalClose = () => {
    setEditPriceModalOpen(false);
  };

  const getCidFromURL = (thePath) =>
    thePath.substring(thePath.lastIndexOf("/") + 1);
  let jsonCid = getCidFromURL(window.location.href);

  async function getNFTdata(jsonCid) {
    if (!jsonCid) {
      console.log("getNftData with no jsonCid!!!");
      return;
    }

    let result = await myUtils.postData("getOneNFT", { jsonCid: jsonCid });

    if (!result) {
      alert("SomeThing Went Wrong");
      window.open("/", "_self");
      return;
    }
    setNftData(result.nftData);

    setNonce(result.nonce);

    console.log("nft data is set to :", result.nftData);
    if (result.auctionData) setAuctionData(result.auctionData);
    if (result.nftData) setNftData(result.nftData);
  }

  useEffect(() => {
    console.log("auctionData: ", auctionData);

    if (!auctionData) return;
    switch (auctionData.status) {
      case Globals.AUCTION_STATUS.SETTLED:
        let settlement = auctionData.settlement;
        if (settlement.length) {
          settlement = handleDates(settlement);
          setAuctionSettlement(settlement);
        }
        break;
      default:
        console.log("unknown auction status!");
        break;
    }
  }, [auctionData]);

  async function getEthPrice() {
    let response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ETHereum&vs_currencies=USD"
    );
    if (response.status === 200) {
      let price = await response.json();
      setEthPrice(price.ethereum.usd);
    }
  }

  useEffect(() => {
    async function func() {
      let nftData = await getNFTdata(jsonCid);
      console.log("n f t d a t a: ");
      // if (nftData) {
      //   setAuctionId(nftData.auctionId);
      //   setNotListed(nftData.status === Globals.NFT_STATUS.NOTLISTED);

      //   getBidsByAuctionData(nftData.auctionData);

      //   if (nftData.transfers.length > 0) {
      //     let nftTransfers = nftData.transfers;
      //     nftTransfers = nftTransfers.map((nftTtransfer) => {
      //       nftTtransfer.date = Moment(nftTtransfer.date)
      //         .locale("fa")
      //         .format("YYYY/M/D HH:mm:ss");
      //       return nftTtransfer;
      //     });

      //     setNftTransfers(nftTransfers.reverse());
      //   }
      // }
    }
    func();
  }, []);

  const handleDates = (_obj) => {
    if (!_obj) return;
    _obj = _obj.map((o) => {
      console.log("------", o.date, Moment.isDate(o.date));
      o.date = Moment(o.date).locale("en").format("YYYY/M/D HH:mm:ss");
      return o;
    });

    return _obj;
  };

  useEffect(() => {
    async function getAndSetOwnerOf() {
      if (!nftData) return;
      let owner = await Nft.ownerOf(nftData.tokenId, session.provider);
      setOwner(owner);
      setOwnerLink(await myUtils.profileLink(owner));
    }
    getAndSetOwnerOf();
  }, [nftData, session.provider, auctionSettlement]);

  useEffect(() => {
    if (nftData) {
      setAuctionId(nftData.auctionId);
      setNotListed(nftData.status === Globals.NFT_STATUS.NOTLISTED);

      // getBidsByAuctionData(nftData.auctionData);

      if (nftData.transfers.length > 0) {
        let nftTransfers = nftData.transfers;
        nftTransfers = nftTransfers.map((nftTtransfer) => {
          nftTtransfer.date = Moment(nftTtransfer.date)
            .locale("en")
            .format("YYYY/M/D HH:mm:ss");
          return nftTtransfer;
        });

        setNftTransfers(nftTransfers.reverse());
      }

      setFileType(nftData.fileType.includes("video") ? "video" : "img");

      setImageUrlOnIPFS(
        "https://" + nftData.artCid + process.env.REACT_APP_IPFS_GATEWAY
      );
      // setNewNftMarketAfterFirstSale()

      console.log("reservePrice is setting to ", Number(nftData.reservePrice));
      setReservePrice(Number(nftData.reservePrice));

      getAndSetUserProfilePhoto();
    }
  }, [nftData]);

  useEffect(() => {
    async function handleReceipt() {
      if (!receipt) {
        console.log("there is no receipt to handle!");
        return;
      }

      console.log("receipt in handleReceipt", receipt);

      if (receipt.status === "0x0") {
        alert(" Transaction failed!");
        return;
      }

      //then this is the first bid
      let info = Market.getInfoFromReceipt(receipt.logs);

      console.log("getInfoFromReceipt receiptInfo:", info.receiptInfo);
      if (receipt.status === "0x1") {
        console.log("transaction was successfull.");

        switch (info.logId) {
          case "MintedReserveAuctionBidPlaced":
            handleReserveAuctionBidPlaced(info.receiptInfo);
            break;
          case "ReserveAuctionBidPlaced":
            handleReserveAuctionBidPlaced(info.receiptInfo);
            break;
          case "ReserveAuctionFinalized":
            HandleReserveAuctionFinalized(info.receiptInfo);
            break;
          default:
            console.log("unknown logId:", info.logId);
        }
      } else {
        alert(" Transaction failed!");
      }
    }

    handleReceipt();
  }, [receipt]);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    makeCountDownTimer(endTime);
  }, [endTime]);

  const handleReserveAuctionBidPlaced = async (receiptInfo) => {
    let newBidData = {
      jsonCid: jsonCid,
      amount: receiptInfo.amount,
      bidder: session.address,
      endTime: receiptInfo.endTime,
      tokenId: receiptInfo.tokenId,
      auctionId: receiptInfo.auctionId,
      txHash: txHash,
      reservePrice: reservePrice,
    };

    console.log("going to post a new bid: %o", newBidData);

    setAuctionId(receiptInfo ? receiptInfo.auctionId : nftData.auctionId);

    let result = await myUtils.postData("aNewBid", newBidData);

    if (!result.success) {
      alert(result.doc.message);
      return;
    }
    console.log("bids are: ", result.doc.bids);

    handleAllBids(result.doc);
  };

  const HandleReserveAuctionFinalized = async (receiptInfo) => {
    let newBidData = {
      jsonCid: jsonCid,
      bidder: receiptInfo.bidder,
      settler: session.address,
      auctionId: receiptInfo.auctionId,
      settlementHash: txHash,
    };

    console.log("going to post the settlment", newBidData);

    let settlementResponse = await myUtils.postData("settle", newBidData);

    if (!settlementResponse.success) {
      alert(settlementResponse.message);
      return;
    }

    let settlement = settlementResponse.doc.settlement;
    if (settlement.length) {
      settlement = handleDates(settlement);
      setAuctionSettlement(settlement);
    }
  };

  useEffect(() => {
    if (newBid && auctionId) getBidsByAuctionId(auctionId); //TODO: to be update on bids, should set a listener to blockchain to get new bids by others
  }, [newBid]);

  useEffect(() => {
    async function func() {
      if (auctionId && session.provider) {
        let minBidAmount = await Market.getMinBidAmount(
          auctionId,
          session.provider
        );
        setMinBidAmount(minBidAmount);

        // Market.getReserveAuction(auctionId, session.provider);
      } else {
        console.log(` auctionId : ${auctionId}  provider:${session.provider}`);
      }
    }
    func();
  }, [auctionId, session.provider]);

  useEffect(() => {
    async function getAuctionDuration() {
      if (session.provider) {
        setAuctionDuration(
          await Market.getReserveAuctionConfig(session.provider)
        );
      } else {
        console.log(` provider:${session.provider}`);
      }
    }
    getAuctionDuration();
  }, [session.provider]);

  const openURL = (link) => {
    window.open(link, "_blank");
  };

  const showPlaceBidModal = async (jsonCid) => {
    await getBidsByAuctionId(auctionId);
    setPlaceABidModalOpen(true);
  };

  const editPrice = (jsonCid) => {
    setEditPriceModalOpen(true);
  };

  const [modalStyle] = useState(getModalStyle);

  const reserveCurrentPrice = (text, price) => (
    <Grid item xs={11} md={5} align="center">
      <Box
        mt={3}
        fontWeight="fontWeightRegular"
        fontSize={13}
        align="center"
        // dir="rtl"
      >
        {text}

        <Box
          mt={1}
          fontWeight="fontWeightBold"
          fontSize={12}
          align="center"
          // dir="rtl"
          sx={reservePrice || { color: "red" }}
        >
          <Box component={"span"} fontSize={15} fontWeight="fontWeightBold">
            {price}
          </Box>{" "}
          Eth
          {/* <Eth /> */}
        </Box>
      </Box>
    </Grid>
  );

  const marketToٍEnglish = (_market) => {
    _market = typeof _market === "string" ? _market.toUpperCase() : _market;
    switch (_market) {
      case "ABCPRO":
      case Globals.NFT_MARKETS.ABCPRO:
        return "ABC pro";
      case "OPENSEA":
      case Globals.NFT_MARKETS.OPENSEA:
        return "Open Sea";
      default:
        return "Unknown!"; //!!!!
    }
  };

  const handdleTextToSign = () => {
    let text = "  To confirm changes \xa0\xa0 \n";
    if (newReservePrice) text = text + `Reserve price: ${newReservePrice} \n`;

    if (newRoyality) text = text + `Royality: ${newRoyality} \n`;

    if (newNftMarketAfterFirstSale)
      text =
        text + `Market: ${marketToٍEnglish(newNftMarketAfterFirstSale)} \n`;

    return text;
  };

  const handleNewArtDataUpdate = async () => {
    try {
      if (!newReservePrice && !newRoyality && !newNftMarketAfterFirstSale) {
        console.log("no new data to update");
        return;
      }
      if (newReservePrice < 0 || newRoyality < 0 || newRoyality > 10) {
        alert("Inputs are incorrect");

        return;
      }

      let oldReservePrice = nftData ? nftData.reservePrice : -1;
      let oldRoyality = nftData ? nftData.royality : -1;
      let oldNftMarketAfterFirstSale = nftData
        ? marketToٍEnglish(nftData.nftMarketAfterFirstSale)
        : null;

      console.log("oldNftMarketAfterFirstSale", oldNftMarketAfterFirstSale);

      console.log("newNftMarketAfterFirstSale", newNftMarketAfterFirstSale);

      if (
        (!newReservePrice || newReservePrice === oldReservePrice) &&
        (!newRoyality || newRoyality === oldRoyality) &&
        (!newNftMarketAfterFirstSale ||
          newNftMarketAfterFirstSale === oldNftMarketAfterFirstSale)
      ) {
        alert("Inputs are the same as before!");

        return;
      }

      setContinueInWallet(true);

      let textToSign = handdleTextToSign();

      UpdateArtDataStepperToNext();

      let signature = await myUtils.signByMetamask(textToSign);
      if (!signature) {
        alert("signature is null, probably your wallet is not connected");
        setContinueInWallet(false);
      }

      UpdateArtDataStepperToNext();

      let params = {
        jsonCid: jsonCid,
        reservePrice: newReservePrice,
        royality: newRoyality,
        nftMarketAfterFirstSale: newNftMarketAfterFirstSale,

        signature: signature,

        textToSign: textToSign,
        from: session.address,
      };
      let result = await Market.toDatabase("updateNewArtData", params);
      console.log("handleNewArtDataUpdate result:", result);

      if (result.success) {
        setNftData(result.doc);
        // setEditPriceModalOpen(false);
        UpdateArtDataStepperToNext();

        session.setAlert({
          text: "Successfully updated",
          variant: "success",
        });
      } else {
        session.setAlert({
          text: "SomeThing went wrong while updating!",
          variant: "error",
        });
      }
      setContinueInWallet(false);
    } catch (e) {
      resetUpdateArtDataStepper();

      session.setAlert({
        text: e.message,
        variant: "info",
      });
      setContinueInWallet(false);
    }
    // resetNewArtDataForUpdate();
  };

  const handleCancelUpdateOfArtData = () => {
    setEditPriceModalOpen(false);
    setContinueInWallet(false);
    resetNewArtDataForUpdate();
    resetUpdateArtDataStepper();
  };

  const resetNewArtDataForUpdate = () => {
    setNewReservePrice(null);
    setNewRoyality(null);
    setNewNftMarketAfterFirstSale(null);
  };

  const reservePriceRoyalityEditModal = (
    <Modal
      open={editPriceModalOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleEditPriceModalClose();
        }
      }}
      dir="ltr"
    >
      <div style={modalStyle} className={classes.paper}>
        <Stepper activeStep={updateArtDataActiveStep} alternativeLabel>
          {UpdateArtDataSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider light={true} />
        <Box m={1} mt={4}>
          <Grid container spacing={2} direction="row">
            <Grid item xs={12} md={5}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    type="number"
                    label="New reserve price "
                    name="newPrice"
                    placeHolder="0.0"
                    autoComplete="newPrice"
                    helperText="Please enter the NFT price"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <Eth color="grey" />
                        </InputAdornment>
                      ),
                    }}
                    // InputLabelProps={{
                    //   shrink: true,
                    // }}
                    onBlur={(event) => setNewReservePrice(event.target.value)}
                    onChange={() => resetUpdateArtDataStepper()}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    mt={2}
                    variant="outlined"
                    fullWidth
                    type="number"
                    label=" New royality"
                    name="royality"
                    placeHolder="0.0"
                    helperText="Maximum royality is 10%"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">%</InputAdornment>
                      ),
                    }}
                    // InputLabelProps={{
                    //   shrink: true,
                    // }}
                    onBlur={(event) => setNewRoyality(event.target.value)}
                    onChange={() => resetUpdateArtDataStepper()}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Hidden mdDown>
              <Grid item md={1} align="center">
                <Divider id="shortVerticalDivider" orientation="vertical" />
              </Grid>
            </Hidden>
            <Grid item xs={12} md={6} align="left">
              <Box mt={2}>
                <FormControl component="fieldset">
                  <FormLabel>
                    <Box fontSize={12} mb={2}>
                      Choose the market after the first sale
                    </Box>
                  </FormLabel>

                  <RadioGroup
                    margin="dense"
                    // value={value}
                    // defaultValue={"abcpro"}
                    onChange={(e) => {
                      setNewNftMarketAfterFirstSale(e.target.value);
                      resetUpdateArtDataStepper();
                    }}
                  >
                    <FormControlLabel
                      label={
                        <Box fontSize={11} color="text.primary">
                          ABC pro
                        </Box>
                      }
                      value="abcpro"
                      control={<Radio size="small" color="default" />}
                      style={{ fontSize: 10 }}
                    />
                    <FormControlLabel
                      value="opensea"
                      control={<Radio size="small" color="default" />}
                      label={
                        <Box fontSize={11} color="text.primary">
                          Open Sea
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <br />

              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Box fontSize={11} style={{ color: grey[500] }}>
                    Current reserve price:{" "}
                    <b>{nftData ? nftData.reservePrice : 0.0} </b>
                    Eth
                  </Box>
                </Grid>
                <Grid item>
                  <Box fontSize={11} style={{ color: grey[500] }}>
                    Current royality: %<b>{nftData ? nftData.royality : 0}</b>
                  </Box>
                </Grid>
                <Grid item>
                  <Box mb={1} fontSize={11} style={{ color: grey[500] }}>
                    Current market:{" "}
                    <b>
                      {nftData
                        ? marketToٍEnglish(nftData.nftMarketAfterFirstSale)
                        : ""}
                    </b>
                  </Box>
                </Grid>
              </Grid>
              <Divider />
            </Grid>
          </Grid>
        </Box>
        {/* <Box mt={2} mb={2} style={{ color: grey[500] }} align="center" n>
          Note: The NFT will be listed by setting a price!
        </Box> */}
        {continueInWallet ? (
          <Grid item xs={12} align="center">
            <div>
              <Box m={2} fontSize={11} style={{ color: green[500] }}>
                Please confirm the changes on your wallet.
              </Box>{" "}
              <LinearProgress
                disableShrink
                style={{ color: green[500] }}
                size={60}
              />
            </div>
          </Grid>
        ) : (
          <Grid container spacing={1} direction="row">
            <Grid item xs={8}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleNewArtDataUpdate}
              >
                Confirm
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleCancelUpdateOfArtData}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        )}
      </div>
    </Modal>
  );

  const makeCountDownTimer = (_endTime) => {
    if (!_endTime) {
      console.log("call makeCountDownTimer but no endTime");
      return;
    }
    let time = _endTime * 1000 - Date.now();
    if (time < 0) {
      setAuctionTimer("00:00:00");
      handleAuctionEnded();

      return;
    }
    let hour = Math.floor(time / (1000 * 60 * 60));
    let minute = Math.floor((time - hour * 60 * 60 * 1000) / (60 * 1000));
    let second = Math.floor(
      (time - (hour * 60 * 60 * 1000 + minute * 60 * 1000)) / 1000
    );

    setAuctionTimer(hour + ":" + minute + ":" + second);

    let t = setTimeout(makeCountDownTimer, 1000, _endTime);
    setTimer(t);
  };

  function handleAuctionEnded() {
    setAuctionEnded(true);
    Market.toDatabase("auctionEnded", { auctionId: auctionId });
    // Market.finalizeAuction(auctionId,session.provider);
  }

  async function getBidsByAuctionId(_auctionId) {
    if (!_auctionId) {
      console.log("getBids but no auctionId!");
      return;
    }
    setPlaceABidButtonDisabled(true);

    let response = await myUtils.postData("bids", {
      auctionId: _auctionId,
    });

    if (!response.success) {
      console.log("geting bids was unsucssessful");
      setPlaceABidButtonDisabled(false);

      return;
    }
    console.log("getBids response:. ", response);

    if (!response.bids.length) {
      console.log("geting bids length is 0");
      setPlaceABidButtonDisabled(false);
      return;
    }

    console.log("received bids", response.bids);

    /**get and set min bid amount */
    if (session.provider) {
      let minBidAmount = await Market.getMinBidAmount(
        _auctionId,
        session.provider
      );

      setMinBidAmount(minBidAmount);
    }

    handleAllBids(response);

    setPlaceABidButtonDisabled(false);

    getEthPrice();
  }

  function handleAllBids(_input) {
    console.log("handleAllBids input:", _input);
    if (_input.endTime !== endTime) {
      if (timer) {
        console.log("Clearing Time out", timer);
        clearTimeout(timer);
      }
      console.log("setEndTime entime:", _input.endTime);
      setEndTime(_input.endTime);
    }
    let bids = _input.bids;
    // bids = Market.convertBidstoEth(bids);
    bids.sort(function (a, b) {
      return b.amount - a.amount;
    });

    setMaxBidder(bids[0].bidder);
    setMaxBidAmount(bids[0].amount);

    bids = bids.map((bid) => {
      bid.date = Moment(bid.date).locale("en").format("YYYY/M/D HH:mm:ss");
      return bid;
    });

    console.log("allBids:", bids);
    setAllBids([...bids]);
  }

  async function waitForMetamaskTxReceipt(_hash) {
    setWaitForTransactionConfirm(true);
    setOpenBackdrop(true);

    let receipt = await window.ethereum.request({
      method: "eth_getTransactionReceipt",
      params: [_hash],
    });
    if (!receipt) {
      setTimeout(waitForMetamaskTxReceipt, 5000, _hash);
    } else {
      setReceipt(receipt);

      placeABidStepperToNext();

      setContinueInWallet(false);
      setWaitForTransactionConfirm(false);
      resetPlaceABidStepper();
      setPlaceABidModalOpen(false);
      setOpenBackdrop(false);
    }
  }

  async function placeABid() {
    if (!nftData) {
      alert("Something went wrong while retriving NFT info");
      return;
    }
    if (reservePrice <= 0) {
      alert("Something went wrong while getting reserve price");

      return;
    }
    if (
      !newBid ||
      (minBidAmount && minBidAmount > newBid) ||
      newBid < reservePrice
    ) {
      let minAmount = minBidAmount ? minBidAmount : reservePrice;
      alert("Your bid must be at least  " + minAmount);

      return;
    }

    if (!session.address) {
      alert("Please connect your wallet first");
      return;
    }

    if (newBid > session.balance) {
      alert("Your balance is insufficient" + session.balance);
      return;
    }

    placeABidStepperToNext();

    setContinueInWallet(true);

    let userEthAddress = nftData ? nftData.userEthAddress : "";

    //TODO check to see whether place bid or first bid
    let result = await Market.getTxParamsToPlaceBid(
      jsonCid,
      userEthAddress,
      reservePrice,
      session.address,
      newBid,
      nftData.auctionId,
      session.provider
    );

    if (!result.success) {
      alert(result.text);
      return;
    }

    let hash = null;

    try {
      hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [result.txParams],
      });

      setTxHash(hash);

      placeABidStepperToNext();

      await waitForMetamaskTxReceipt(hash);
    } catch (e) {
      session.setAlert({ text: e.message, variant: "error" });
      resetPlaceABidStepper();
      setContinueInWallet(false);
    }
  }

  const handleListing = async () => {
    let confirmed;
    if (reservePrice <= 0) {
      alert("determine a price before listing");
      return;
    }
    if (notListed) {
      confirmed = window.confirm("are you sure to list your NFT");
      var confirmationText = `I want to list the NFT (nonce: ${nonce})`;
    } else {
      confirmed = window.confirm("Are you sure to delist the NFT");
      var confirmationText = `I want to delist the NFT (nonce: ${nonce})`;
    }
    if (!confirmed) return;

    let signature = await myUtils.signByMetamask(confirmationText);
    if (!signature) {
      alert("signature is null, probably your wallet is not connected");
    }

    let data = {
      jsonCid: nftData.jsonCid,
      from: session.address,
      textToSign: confirmationText,
      signature: signature,
    };

    let result = await myUtils.postData("toggleNftListing", data);

    if (result.success) {
      setNotListed(result.doc.status === Globals.NFT_STATUS.NOTLISTED);
      if (result.doc.status === Globals.NFT_STATUS.NOTLISTED)
        var text = "Delisted successfully";
      else text = "Listed successfully";

      session.setAlert({
        text: text,
        variant: "success",
      });

      return;
    }

    session.setAlert({
      text: "Something went wrong please try again later!",
      variant: "error",
    });
  };

  async function settleAuction(_auctionId) {
    let answer = window.confirm(
      "Every body can settle an auction, do you want to do that?"
    );
    if (!answer) return;

    let result = Market.finalizeReserveAuction(_auctionId, session.address);
    if (!result.success) {
      console.log("can not make txParams for finalizeReserveAuction!");
      return;
    }

    try {
      let hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [result.txParams],
      });

      setTxHash(hash);

      alert("Please wait for transaction confirmation!");

      setOpenBackdrop(true);
      //TODO: should check receipt client side or server side
      await waitForMetamaskTxReceipt(hash);
    } catch (e) {
      console.log(e);
      alert(e.message);
      return;
    }
  }

  const auctionSettlmentButon = !auctionSettlement ? (
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      size="large"
      onClick={() => settleAuction(auctionId)}
    >
      Settle auction
      <GavelRoundedIcon className={classes.extendedIcon} />
    </Button>
  ) : (
    ""
  );

  const placeABidModal = (
    <Modal
      // disableBackdropClick
      open={placeABidModalOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleEditPriceModalClose();
        }
      }}
      dir="ltr"
    >
      <div style={modalStyle} className={classes.paper}>
        <Box mb={1}>
          <Stepper activeStep={placeABidActiveStep} alternativeLabel>
            {placeABidSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Divider light={true} />
        </Box>

        <Box mb={3} mt={4}>
          <TextField
            variant="outlined"
            required
            fullWidth
            type="number"
            label="Bid"
            name="newPrice"
            //  defaultValue={minBidValue}
            // defaultValue="0"
            autoFocus
            autoComplete="newBid"
            helperText={
              minBidAmount
                ? " A bid must be at leat  " + minBidAmount + " Eth "
                : " At least: " + reservePrice + " Eth "
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Eth />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            onBlur={(event) => setNewBid(event.target.value)}
          />
          <Box mt={3} fontSize={11} color="text.secondary">
            Your baalance <b>{parseFloat(session.balance).toPrecision(5)}</b>
            Eth
          </Box>
          <Box fontSize={11} color="text.secondary" mt={1}>
            The market after sale:
            <b>
              {" "}
              «
              {nftData ? marketToٍEnglish(nftData.nftMarketAfterFirstSale) : ""}
              »
            </b>
          </Box>
        </Box>

        <Box mb={1}>
          <Divider id="placeABidModalBodyDown" />
        </Box>

        {!continueInWallet ? (
          <Grid container spacing={1} direction="row">
            <Grid item xs={8}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={placeABid}
                disabled={false}
              >
                Ok
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setPlaceABidModalOpen(false);
                  resetPlaceABidStepper();
                }}
                fullWidth
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        ) : (
          <div>
            {!waitForTransactionConfirm ? (
              <Box
                mt={2}
                mb={2}
                fontSize={11}
                style={{ color: green[500] }}
                align="center"
              >
                Continue on your wallet
              </Box>
            ) : (
              <Box mt={2} mb={2} fontSize={11} align="center">
                Continue on your wallet
              </Box>
            )}

            {waitForTransactionConfirm ? (
              <Box
                mt={2}
                mb={2}
                fontSize={11}
                style={{ color: green[500] }}
                align="center"
              >
                wait for transaction to be submitted
              </Box>
            ) : (
              ""
            )}

            <LinearProgress />
          </div>
        )}
      </div>
    </Modal>
  );

  const placeABidButton = (
    <div>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        disabled={placeABidButtonDisabled}
        onClick={() => showPlaceBidModal(jsonCid)}
      >
        Place a bid
        <ShoppingBasketIcon className={classes.extendedIcon} />
      </Button>
      {placeABidModal}
    </div>
  );

  const highestBidYoursButton = (
    <div>
      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled
        style={{ color: green[500] }}
      >
        The highest bid is yours
        <ThumbUpRoundedIcon className={classes.extendedIcon} />
      </Button>
    </div>
  );

  const artNotListedYetButton = (
    <Button
      variant="outlined"
      color="secondary"
      disabled
      fullWidth
      size="large"
    >
      Not listed yet
      <ShoppingBasketIcon className={classes.extendedIcon} />
    </Button>
  );

  const artListedButton =
    String(session.address).toLowerCase() === String(maxBidder).toLowerCase()
      ? highestBidYoursButton
      : placeABidButton;

  const auctionNotSettledYetButton = notListed
    ? artNotListedYetButton
    : artListedButton;

  const placeAbidButtonSection = auctionEnded
    ? auctionSettlmentButon
    : auctionNotSettledYetButton;

  const editPriceButton = !auctionId ? (
    <div>
      <Grid container spacing={1} justifyContent="space-between">
        <Grid item xs={5}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="medium"
            onClick={() => editPrice(jsonCid)}
          >
            <EditOutlinedIcon className={classes.extendedIcon} />
            Edit
          </Button>
        </Grid>
        <Grid item xs={5}>
          <Tooltip
            title={
              reservePrice <= 0 ? "Determine reserve price before listing" : ""
            }
          >
            <span style={{ cursor: "not-allowed" }}>
              <Button
                variant={notListed ? "contained" : "outlined"}
                disableElevation
                color="primary"
                fullWidth
                size="medium"
                onClick={handleListing}
                disabled={reservePrice <= 0}
              >
                {notListed ? (
                  <PlaylistAddRoundedIcon className={classes.extendedIcon} />
                ) : (
                  <PlaylistAddCheckRoundedIcon
                    className={classes.extendedIcon}
                  />
                )}
                List
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>
      {reservePriceRoyalityEditModal}
      <div>
        <Tooltip title="You can not buy your NFT">
          <Button
            style={{ marginTop: 5, color: grey[400] }}
            variant="outlined"
            fullWidth
            size="large"
          >
            Place a bid
            <ShoppingBasketIcon className={classes.extendedIcon} />
          </Button>
        </Tooltip>
      </div>
    </div>
  ) : (
    <div>
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        size="large"
        disabled
      >
        <HourglassFullRoundedIcon className={classes.extendedIcon} />
        Auction is in process
      </Button>
    </div>
  );

  const makeAddressShort = (_address) => {
    if (!_address) {
      console.log("there is no address to make it short!");
      return;
    }
    _address = myUtils.toChecksumAddress(_address);
    if (session.address) {
      return session.address.toLowerCase() !== _address.toLowerCase() ? (
        <Box
          component="span"
          fontStyle="oblique"
          fontFamily="Monospace"
          fontWeight="fontWeightBold"
        >
          {String(_address).substring(0, 6) +
            "..." +
            String(_address).substring(38)}
        </Box>
      ) : (
        "You"
      );
    } else {
      return (
        <Box
          component="span"
          fontStyle="oblique"
          fontFamily="Monospace"
          fontWeight="fontWeightBold"
        >
          {String(_address).substring(0, 6) +
            "..." +
            String(_address).substring(38)}
        </Box>
      );
    }
  };

  const auctionSettlerSection = auctionSettlement ? (
    <Grid item xs={12} align="center" className={classes.bidInfo}>
      <Paper
        elevation={3}
        variant={"outlined"}
        // boxShadow={3}
        // border={1}
        // borderColor="success.light"
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          // style={{ backgroundColor: grey[100] }}
        >
          
          <Grid item sm={11}>
            <Box mt={1} mb={1} fontWeight="fontWeightRegular" fontSize={12}>
              Auction is ended by:{" "}
              {makeAddressShort(auctionSettlement[0].settler)}
            </Box>
            <Box mt={1} mb={1} fontWeight="fontWeightRegular" fontSize={11}>
              Date :{auctionSettlement[0].date}
            </Box>
          </Grid>
          <Grid item sm={1}>
            <Link
              href={
                process.env.REACT_APP_RINKEBY_EXPLORER_URI +
                auctionSettlement.settlementHash
              }
              target="_blank"
              rel="noreferrer"
            >
              <OpenInNewTwoToneIcon className={classes.extendedIcon} />
            </Link>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  ) : (
    ""
  );

  const auctionWinnerSection = auctionEnded ? (
    <Grid item xs={11} md={11} align="center" className={classes.bidInfo}>
      <Box mt={3} mb={2} fontWeight="fontWeightBold" fontSize={16}>
        Sold at {maxBidAmount} Eth to {maxBidder}
        <Box
          mt={1}
          align="center"
          dir="ltr"
          fontStyle="oblique"
          fontFamily="Monospace"
          fontWeight="fontWeightBold"
          fontSize="h6.fontSize"
        >
          {maxBidder}
        </Box>
      </Box>
    </Grid>
  ) : (
    ""
  );

  function equalsIgnoringCase(text, other) {
    return text.localeCompare(other, undefined, { sensitivity: "base" }) === 0;
  }
  const ownerAnnouncementSection = owner ? (
    <Grid item xs={11} md={11} align="center">
      <Box mt={3} mb={4} fontWeight="fontWeightBold" fontSize={15}>
        {equalsIgnoringCase(owner, session.address)
          ? "You are the current owner"
          : " The current owner is"}
        <Link href={ownerLink} underline="none">
          <Box
            mt={1}
            align="center"
            dir="ltr"
            fontStyle="oblique"
            fontFamily="Monospace"
            fontWeight="fontWeightBold"
            fontSize="h6.fontSize"
          >
            {equalsIgnoringCase(owner, session.address) ? "" : owner}
          </Box>
        </Link>
      </Box>
    </Grid>
  ) : (
    ""
  );

  const nftMarketAfterFirstSaleSection = !auctionEnded ? (
    <Grid item xs={11} md={11} align="center">
      <Box mb={3} fontWeight="fontWeightBold" fontSize={13}>
        {marketToٍEnglish(nftData?.nftMarketAfterFirstSale) === "ABC pro"
          ? "This NFT will remain in"
          : "This NFT will be moved to"}{" "}
        {nftData ? marketToٍEnglish(nftData.nftMarketAfterFirstSale) : ""}
        {""} after the first sell.
      </Box>
    </Grid>
  ) : (
    ""
  );
  const auctionWinnerSectionInAccordionSummery = auctionEnded ? (
    <Grid item xs={12} align="center">
      <Box
        border={1}
        boxShadow={2}
        borderColor="success.light"
        mb={2}
        p={2}
        fontWeight="fontWeightBold"
        fontSize={12}
        align="center"
        style={{ color: grey[800] }}
      >
        Sold to {makeAddressShort(maxBidder)} price: {maxBidAmount}{" "}
      </Box>
    </Grid>
  ) : (
    " in auction "
  );

  const showBidsSection = allBids.length ? (
    <Grid name="allbids" item xs={12} md={12} justifyContent="flex-start">
      <Accordion defaultExpanded={nftTransfers ? false : true}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Box color="primary.main" fontSize={12}>
            Auction/Bids history
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container justifyContent="space-between" alignItems="center">
            {auctionWinnerSectionInAccordionSummery}

            {auctionSettlerSection}
            {allBids.map((bid) => (
              <Grid item xs={12}>
                <Box mt={1}>
                  <Paper elevation={3} variant={"outlined"}>
                    <Box m={1}>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        direction="row"
                      >
                        <Grid item xs={6}>
                          <Box align="right" fontSize={12}>
                            Bidder: {makeAddressShort(bid.bidder)}
                          </Box>
                          <Box align="right" fontSize={11}>
                            Date: {bid.date}
                          </Box>
                        </Grid>

                        <Grid item xs={5}>
                          <Box fontSize={12}>Amount: {bid.amount} Eth</Box>
                          <Box fontSize={11}>
                            {Math.round(
                              (bid.amount * ethPrice + Number.EPSILON) * 100
                            ) / 100}{" "}
                            $
                          </Box>
                        </Grid>
                        <Grid item xs={1}>
                          <Link
                            href={
                              process.env.REACT_APP_RINKEBY_EXPLORER_URI +
                              bid.txHash
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <OpenInNewTwoToneIcon
                              className={classes.extendedIcon}
                            />
                          </Link>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>{" "}
                </Box>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  ) : (
    ""
  );

  const nftTransferSection = nftTransfers ? (
    <Grid
      name="allnftTransfers"
      item
      xs={12}
      md={12}
      justifyContent="flex-start"
    >
      <Accordion // defaultExpanded
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Box color="info.main" fontSize={12}>
            Sale history on OpneSea
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container justifyContent="space-between" alignItems="center">
            {nftTransfers.map((nftTransfer) => (
              <Grid item xs={12}>
                <Box mt={1}>
                  <Paper elevation={3} variant={"outlined"}>
                    <Box m={1}>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        direction="row"
                      >
                        <Grid item md={5}>
                          <Typography gutterBottom align="left">
                            seller: {makeAddressShort(nftTransfer.seller)}
                          </Typography>
                          <Typography gutterBottom align="left">
                            In: {nftTransfer.date}
                          </Typography>
                        </Grid>

                        <Grid item md={5}>
                          <Typography gutterBottom align="left">
                            Buyer: {makeAddressShort(nftTransfer.buyer)}
                          </Typography>
                          <Typography gutterBottom>
                            {nftTransfer.price} Eth (
                            {Math.round(
                              (nftTransfer.price * ethPrice + Number.EPSILON) *
                                100
                            ) / 100}{" "}
                            $ )
                          </Typography>
                        </Grid>
                        <Grid item md={1}>
                          <Link
                            href={
                              process.env.REACT_APP_RINKEBY_EXPLORER_URI +
                              nftTransfer.txHash
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <OpenInNewTwoToneIcon
                              className={classes.extendedIcon}
                            />
                          </Link>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>{" "}
                </Box>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  ) : (
    ""
  );

  const timerSection = !auctionEnded ? (
    <Grid item xs={11} md={5} align="center" className={classes.bidInfo}>
      {" "}
      <Box
        mt={3}
        mb={2}
        fontWeight="fontWeightRegular"
        fontSize={13}
        align="center"
        // dir="rtl"
      >
        {auctionDuration} hours after the first bit, the NFT will be sold to the
        highest bid.
      </Box>
      {auctionTimer ? "Remaining time" : ""}
      <Typography gutterBottom variant="h4" align="center" dir="ltr">
        {auctionTimer}
      </Typography>
    </Grid>
  ) : (
    ""
  );

  const reserveCurrentPriceSection = maxBidAmount
    ? reserveCurrentPrice("current bid", maxBidAmount)
    : reserveCurrentPrice("Reserve price", reservePrice);

  const auctionButton = (
    <Grid name="bid/editButton" item xs={12} md={12} align="center">
      <Box mt={2} mb={2}>
        {!auctionEnded &&
        session.address ===
          (nftData ? nftData.userEthAddress.toLowerCase() : null)
          ? editPriceButton
          : placeAbidButtonSection}
      </Box>
    </Grid>
  );
  async function getAndSetUserProfilePhoto() {
    console.log("getAndSetUserProfilePhoto -------------", nftData);
    if (!nftData) return;
    let walletProfile = await getUserProfile(nftData.userEthAddress);
    if (!walletProfile) return;

    if (walletProfile)
      if (walletProfile.profilePhoto) {
        let src = `data:${
          walletProfile.profilePhoto.contentType
        };base64,${Buffer.from(walletProfile.profilePhoto.data).toString(
          "base64"
        )}`;
        setProfilePhoto(src);
      }
  }

  useEffect(() => {
    if (!auctionData) return;

    async function func() {
      setPlaceABidButtonDisabled(true);

      if (!auctionData.bids.length) {
        console.log("geting bids length is 0");
        setPlaceABidButtonDisabled(false);
        return;
      }

      console.log("received bids", auctionData.bids);

      /**get and set min bid amount */
      if (session.provider) {
        let minBidAmount = await Market.getMinBidAmount(
          auctionData.auctionId,
          session.provider
        );

        setMinBidAmount(minBidAmount);
      }

      handleAllBids(auctionData);

      setPlaceABidButtonDisabled(false);

      getEthPrice();
    }
    func();
  }, [auctionData]);

  useEffect(() => {
    if (!session.alert) return;
    setMessageModalOpen(true);
  }, [session.alert]);

  const handleMessageModalClose = () => {
    setMessageModalOpen(false);
    if (editPriceModalOpen) handleEditPriceModalClose();
  };
  const messageModal = (
    <Modal
      open={messageModalOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleMessageModalClose();
        }
      }}
    >
      <div style={modalStyle} className={classes.paper}>
        <Grid container spacing={1} direction="column" align="center">
          <Grid item>
            <Box my={3}>{session.alert ? session.alert.text : ""}</Box>
          </Grid>

          <Grid>
            <Divider light={true} />
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color={session.alert ? session.alert.variant : ""}
              onClick={() => {
                handleMessageModalClose();
                // setMessageModalOpen(false);
              }}
              fullWidth
            >
              Close
            </Button>
          </Grid>
        </Grid>
      </div>
    </Modal>
  );

  const handleFullscreen = () => {
    if (isFullscreen) {
      handle.exit();
      setIsFullscreen(false);
    } else {
      handle.enter();
      setIsFullscreen(true);
    }
  };

  const handleMouseOverOnViews = (event) => {
    let temp = [];
    temp[event.currentTarget.id] = grey[200];
    setOnViewsBgColor(temp);
  };

  const handleMouseOutOnViews = (event) => {
    let temp = [];
    setOnViewsBgColor(temp);
  };

  const viewOns = (_imageUrlOnIPFS, _text, _id, _color = null) => (
    <Grid item xs={12} md={10} align="center">
      <Box mt={1}>
        <Link
          href={_imageUrlOnIPFS}
          target="_blank"
          rel="noreferrer"
          underline="none"
        >
          <Paper
            id={_id}
            elevation={3}
            style={{ color: _color, backgroundColor: onViewsBgColor[_id] }}
            onMouseOver={handleMouseOverOnViews}
            onMouseOut={handleMouseOutOnViews}
          >
            <Box m={1}>
              <Grid
                container
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={1}>
                  <OpenInNewTwoToneIcon className={classes.extendedIcon} />
                </Grid>
                <Grid item xs={10}>
                  <Box fontSize={12}>{_text} </Box>
                </Grid>
                <Grid item xs={1}>
                  <VisibilityRoundedIcon className={classes.extendedIcon} />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Link>
      </Box>
    </Grid>
  );

  return (
    <div>
      <div id="back-to-top-anchor" className={classes.heroContent} />
      <Container
        className={classes.cardGrid}
        maxWidth="md"
        justifyContent="center"
      >
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={12} md={6}>
            <Card className={classes.card}>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={300} />
              ) : (
                ""
              )}
              <FullScreen handle={handle}>
                <CardMedia
                  component={fileType}
                  className={classes.cardMedia}
                  image={imageUrlOnIPFS}
                  title={nftData ? nftData.artName : ""}
                  autoPlay
                  controls
                  onLoad={handleImageLoaded}
                  onClick={handleFullscreen}
                />
              </FullScreen>
            </Card>
          </Grid>
          <Grid
            container
            name="itemsBelowTheArt"
            justifyContent="space-between"
          >
            <Grid item>
              <Fab
                variant="extended"
                size="medium"
                color="default"
                onClick={() => props.showUserProfile(nftData)}
              >
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  direction="row"
                >
                  <Grid item xs={10}>
                    {nftData ? nftData.artistName + "@" : ""}
                  </Grid>
                  <Grid item xs={1}></Grid>
                  <Grid item xs={1}>
                    <Avatar alt="artist" src={profilePhoto} />
                  </Grid>
                </Grid>
              </Fab>
            </Grid>
            <Grid item>
              <ActionsButton handleFullscreen={handleFullscreen} />
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Container className={classes.detailsGrid}>
        <Grid container display="flex" direction="row-reverse">
          <Grid item xs={12} md={5} sx={{ paddingLeft: "20px" }}>
            <Box mt={3}>
              <Grid container id="auctionInfo" display="flex" direction="row">
                {ownerAnnouncementSection}
                {nftMarketAfterFirstSaleSection}
                {nftTransferSection}
                {/* {auctionWinnerSection} */}
                {timerSection}
                {/* {auctionSettlerSection} */}
                {!auctionEnded ? (
                  <Hidden mdDown>
                    <Grid item md={1} align="center">
                      <Divider
                        id="shortVerticalDivider"
                        orientation="vertical"
                      />
                    </Grid>
                  </Hidden>
                ) : (
                  ""
                )}

                {!auctionEnded ? reserveCurrentPriceSection : ""}
                {auctionButton}
                {showBidsSection}
              </Grid>
            </Box>
          </Grid>
          <Grid item md={1}>
            <Hidden mdDown>
              <Divider id="longVerticalDivider" orientation="vertical" />
            </Hidden>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container id="nftInformation" display="flex">
              <Grid item xs={12}>
                <Typography gutterBottom variant="h3" align="left">
                  {nftData ? nftData.artName : ""}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" align="left" gutterBottom>
                  Description
                </Typography>
                <Typography variant="subtitle1" align="left" dir="ltr">
                  {nftData ? nftData.description : ""}
                </Typography>
              </Grid>
            </Grid>
            <Box mt={4}>
              <Grid container id="ViewOnsItems" justifyContent="center">
                {viewOns(imageUrlOnIPFS, "view the NFT on IPFS", 0)}

                {viewOns(
                  "https://" + jsonCid + process.env.REACT_APP_IPFS_GATEWAY,
                  "view the meta deta on IPFS",
                  1
                )}
                {auctionSettlement &&
                nftData.nftMarketAfterFirstSale ===
                  Globals.NFT_MARKETS.OPENSEA ? (
                  <BlackTooltip title="some minutes should be passed from the auction">
                    {viewOns(
                      process.env.REACT_APP_OPENSEA_BASE_URL +
                        "/assets/" +
                        ABCNFT721_ADDRESS +
                        "/" +
                        nftData.tokenId,
                      "view on OpenSea",
                      2,
                      blue[500]
                    )}
                  </BlackTooltip>
                ) : (
                  ""
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Box pt={5} className={classes.divider}>
        <Divider id="footerDivider" />
      </Box>
      {messageModal}
      <Backdrop
        className={classes.backdrop}
        open={openBackdrop}
        //onClick={handleBackdropClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
