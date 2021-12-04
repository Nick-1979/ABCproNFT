import { useState, useEffect, useContext } from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { Box } from "@mui/material";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import PropTypes from "prop-types";
import Zoom from "@mui/material/Zoom";
import SessionContext from "../wallet/sessionContext";
import MenuItem from "@mui/material/MenuItem";
import Globals from "../../utils/globals";
import { Eth } from "@rimble/icons"; ///   cryptocurrency-icons
import { isMobile } from "react-device-detect";
// import useTranslation from '../../hooks/useTranslation';
import { useTranslation } from "react-i18next";

import {
  Hidden,
  Tabs,
  Divider,
  Select,
  FormControl,
  FormHelperText,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import SearchBox from "./searchBox";
import myUtils from "../../utils/general";
import {
  FavoriteBorder as FavoriteBorderIcon,
  SortRounded as SortRoundedIcon,
  ReceiptTwoTone as ReceiptTwoToneIcon,
  FormatPaintTwoTone as FormatPaintTwoToneIcon,
  ShoppingBasketTwoTone as ShoppingBasketTwoToneIcon,
  DnsOutlined as DnsOutlinedIcon,
  BorderAllRounded as BorderAllRoundedIcon,
} from "@mui/icons-material";
import Skeleton from "@mui/material/Skeleton";

/**  * RTL stuff */
import { rtlTheme } from "../../utils/rtl";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */

function ScrollTop(props) {
  const { children, window } = props;
  const classes = useStyles();
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleToTopClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  return (
    <Zoom in={trigger}>
      <div
        onClick={handleToTopClick}
        role="presentation"
        className={classes.root}
      >
        {children}
      </div>
    </Zoom>
  );
}

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

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
  headerLogo: {
    marginTop: theme.spacing(3),
  },
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(8),
  },
  tabGrid: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  card: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    // paddingTop: "10", // 16:9
    // height: "100%",
    // width: "100%",
    // zIndex:theme.zIndex.drawer-1
  },
  logo: {
    height: 25,
    width: 64,
  },
  cardContent: {
    flexGrow: 1,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function ArtGallery(props) {
  // const { t } = useTranslation();
  const { t } = useTranslation();

  const classes = useStyles();
  const session = useContext(SessionContext);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState([]);

  const [artData, setArtData] = useState([]);

  const [soldNFTs, setSoldNFTs] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);

  const [listedNFTs, setListedNFTs] = useState([]);
  const [notListedNFTs, setNotListedNFTs] = useState([]);
  const [onAuctionNFTs, setOnAuctionNFTs] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [raised, setRaised] = useState([]);
  const [sortType, setSortType] = useState("");
  const [popUpWalletSignal, setPopUpWalletSignal] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(true);
  const handleBackdropClose = () => {
    // setOpenBackdrop(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  async function onLike(index) {
    if (!session.address) {
      //pop up wallet
      setPopUpWalletSignal(true);
      return;
    }
    if (artData[index]) {
      let data = {
        WalletAddress: session.address,
        jsonCid: artData[index].nft.jsonCid,
      };

      console.log("nft.jsonCid in onlike : ", artData[index]);
      let result = await myUtils.postData("like", data);
      // let res = await fetch("http://localhost:8080/posts/like", {
      //   method: "POST",
      //   body: JSON.stringify(data),
      //   headers: {
      //     "Content-type": "application/json; charset=UTF-8",
      //   },
      // });

      if (result) {
        // let { likeCount } = result.likeCount;
        // setIsLiked(liked);
        console.log("likeCount likeCount [likeCount]: ", result.likeCount);

        artData[index].nft.likes = result.likeCount;
        artData[index].nft.liked = true;
        setArtData([...artData]); //to apply likes
        console.log("likeCount artData[index]: ", artData[index]);
      }
    }
  }

  const getAllNFTsjsons = async () => {
    let nftData = await myUtils.postData("getAllNFTs", {
      userEthAddress: session.address,
    });
    console.log("getting  all nftData nftData: ", nftData);

    if (nftData) {
      nftData.map((item) => (item.cardLabel = myUtils.prepareCardLabels(item)));

      console.log("fetched all nftData :", nftData);
      /**
       * TODO: Not just set nfts in different categories but also sort each category accordingly
       * e.g. onsales should be sort based on sale remaining time
       */
      if (nftData.length) {
        setAllNFTs(nftData);

        setSoldNFTs(
          nftData.filter(
            (item) =>
              item.nft.status === Globals.NFT_STATUS.SOLD ||
              item.nft.status === Globals.NFT_STATUS.SETTLED
          )
        );
        setNotListedNFTs(
          nftData.filter(
            (item) => item.nft.status === Globals.NFT_STATUS.NOTLISTED
          )
        );
        setOnAuctionNFTs(
          nftData.filter(
            (item) => item.nft.status === Globals.NFT_STATUS.ONAUCTION
          )
        );
        let readyToSaleAndOnSaleNfts = nftData.filter(
          (item) =>
            item.nft.status === Globals.NFT_STATUS.LISTED ||
            item.nft.status === Globals.NFT_STATUS.ONAUCTION
        );
        setListedNFTs(readyToSaleAndOnSaleNfts);

        if (readyToSaleAndOnSaleNfts.length) {
          setCards(Array.from(Array(readyToSaleAndOnSaleNfts.length).keys()));
          setArtData([...readyToSaleAndOnSaleNfts]);

          setLoading(new Array(readyToSaleAndOnSaleNfts.length).fill(1));
        } else {
          //if there is no ready to sale nft, show all tab
          setCards(Array.from(Array(nftData.length).keys()));
          setArtData([...nftData]);
          setLoading(new Array(nftData.length).fill(1));

          setTabValue(4);
        }
      } else {
        console.log(
          "something went wrong while getting CIDs  or there may be no nft yet"
        );
      }
      setOpenBackdrop(false);
    } else {
      console.log("something went wrong while getting CIDs 2");
    }
  };

  useEffect(() => {
    getAllNFTsjsons();
  }, []);

  useEffect(() => {
    //putting arts in tabs
    switch (tabValue) {
      case 0:
        setCards(Array.from(Array(listedNFTs.length).keys()));
        setArtData([...listedNFTs]);
        break;
      case 1:
        setCards(Array.from(Array(onAuctionNFTs.length).keys()));
        setArtData([...onAuctionNFTs]);

        break;
      case 2:
        setCards(Array.from(Array(soldNFTs.length).keys()));
        setArtData([...soldNFTs]);

        break;
      case 3:
        setCards(Array.from(Array(notListedNFTs.length).keys()));
        setArtData([...notListedNFTs]);
        break;
      case 4:
        setCards(Array.from(Array(allNFTs.length).keys()));
        setArtData([...allNFTs]);
        break;
      default:
        setCards(Array.from(Array(allNFTs.length).keys()));
        setArtData([...allNFTs]);
    }
  }, [tabValue]);

  function makeCountDownTimers(_endTime) {
    let time = _endTime * 1000 - Date.now();
    if (time < 0) {
      return;
    }
    let hour = Math.floor(time / (1000 * 60 * 60));
    let minute = Math.floor((time - hour * 60 * 60 * 1000) / (60 * 1000));
    let second = Math.floor(
      (time - (hour * 60 * 60 * 1000 + minute * 60 * 1000)) / 1000
    );
    return hour + ":" + minute + ":" + second;
  }

  useEffect(() => {
    if (!onAuctionNFTs) {
      console.log("there is no onAuctionNFTs");
      return;
    }
    // console.log('there should beeeeeeeeeeeeeeeeee  no onAuctionNFTs',onAuctionNFTs);

    let nfts = [...onAuctionNFTs];
    nfts.map((nft) => {
      nft.timer = makeCountDownTimers(nft.auction.endTime);
      return nft;
    });
    setTimeout(setOnAuctionNFTs, 1000, onAuctionNFTs);
  }, [onAuctionNFTs]);

  useEffect(() => {
    sortArtData(sortType);
  }, [sortType]);

  const capitalizeFirstLetter = (string) => {
    console.log(string.charAt(0).toUpperCase() + string.slice(1).toLowerCase());
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const sortArtData = (sType) => {
    switch (sType) {
      case "mostExpensive":
        artData.sort(function (a, b) {
          let aPrice = myUtils.getHighestBid(a)
            ? myUtils.getHighestBid(a)
            : a.nft.reservePrice;
          let bPrice = myUtils.getHighestBid(b)
            ? myUtils.getHighestBid(b)
            : b.nft.reservePrice;
          return bPrice - aPrice;
        });
        setArtData([...artData]);

        break;
      case "cheapest":
        artData.sort(function (a, b) {
          let aPrice = myUtils.getHighestBid(a)
            ? myUtils.getHighestBid(a)
            : a.nft.reservePrice;
          let bPrice = myUtils.getHighestBid(b)
            ? myUtils.getHighestBid(b)
            : b.nft.reservePrice;
          return aPrice - bPrice;
        });
        setArtData([...artData]);

        break;
      case "mostLiked":
        artData.sort(function (a, b) {
          return b.nft.likes - a.nft.likes;
        });
        setArtData([...artData]);

        break;
      case "newest":
        artData.sort(function (a, b) {
          return new Date(b.nft.creationDate) - new Date(a.nft.creationDate);
        });
        setArtData([...artData]);

        break;
      case "oldest":
        artData.sort(function (a, b) {
          return new Date(a.nft.creationDate) - new Date(b.nft.creationDate);
        });
        setArtData([...artData]);

        break;
      default:
        break;
    }
    console.log(artData);
  };

  const getNftsBasedOnTabValue = (_tabVal) => {
    switch (_tabVal) {
      case 0:
        return listedNFTs;
      case 1:
        return onAuctionNFTs;
      case 2:
        return soldNFTs;
      case 3:
        return notListedNFTs;
      case 4:
        return allNFTs;
      default:
        return allNFTs;
    }
  };

  let fileType = (item) => {
    if (item) {
      return item.nft.fileType.includes("video") ? "video" : "img";
    } else return "img";
  };

  const imageOnIPFS = (item) => {
    if (item) {
      return "https://" + item.nft.artCid + process.env.REACT_APP_IPFS_GATEWAY;
    }
  };

  const handleSortTypeChange = (e) => {
    setSortType(e.target.value);
  };

  async function doSearch(searchItem) {
    let data = getNftsBasedOnTabValue(tabValue);
    if (!searchItem) {
      setArtData([...data]);
      setCards(Array.from(Array(data.length).keys()));
      return;
    }
    let result = data.filter((item) => {
      for (let key in item.nft) {
        if (
          String(item.nft[key]).toLowerCase().includes(searchItem.toLowerCase())
        ) {
          return item;
        }
      }
    });
    setArtData([...result]);
    setCards(Array.from(Array(result.length).keys()));
  }
  function toggleRaised(_index) {
    let temp = [...raised];
    temp[_index] = !temp[_index];
    setRaised(temp);
  }

  const cardActionsSection = (item) =>
    item.nft.auctionId
      ? cardActionsSectionWithAuctionId(item)
      : cardActionsSectionWithOutAuctionId(item);

  const cardActionsSectionWithOutAuctionId = (item) => (
    <Grid container direction="row" alignItems="center">
      <Grid item xs={9}>
        <Button
          color="primary"
          id="showArtPage"
          style={{ fontSize: 10 }}
          onClick={() => myUtils.showArtPage(item.nft)}
        >
          {item.cardLabel}
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Box size="small" color="primary">
          {item.nft
            ? item.nft.reservePrice
              ? item.nft.reservePrice
              : "0.0"
            : "0.0"}
        </Box>
      </Grid>
      <Grid item xs={1}>
        <Eth />
      </Grid>
    </Grid>
  );

  const cardActionsSectionWithAuctionId = (item) => {
    return item.nft.status === Globals.NFT_STATUS.SETTLED ? (
      <Box
        pt={2}
        p={1}
        bgcolor="grey.900"
        color="secondary.contrastText"
        borderRadius="5px"
        width="100%"
        align="center"
        borderColor="success.light"
        border={1}
      >
        <Box fontSize={13} fontWeight="fontWeightRegular" color="primary">
          {item.timer}
        </Box>
        <Grid
          container
          direction="row"
          // justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={8} align="right">
            <Button
              style={{
                color: "#FFFFFF",
                fontSize: 10,
              }}
              id="showArtPage"
              onClick={() => myUtils.showArtPage(item.nft)}
            >
              {item.cardLabel}
            </Button>
          </Grid>
          <Grid item xs={3} align="center">
            <Box size="small" color="primary">
              {myUtils.getHighestBid(item)}
            </Box>
          </Grid>
          <Grid item xs={1}>
            <Eth color="grey" />
          </Grid>
        </Grid>
      </Box>
    ) : (
      <Box
        pt={2}
        p={1}
        bgcolor="grey.800"
        color="secondary.contrastText"
        borderRadius="5px"
        width="100%"
        align="center"
        borderColor="secondary.main"
        border={1}
      >
        <Box fontSize={13} fontWeight="fontWeightRegular" color="primary">
          {item.timer}
        </Box>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={8} align="right">
            <Button
              style={{
                color: "#FFFFFF",
                fontSize: 10,
              }}
              id="showArtPage"
              onClick={() => myUtils.showArtPage(item.nft)}
            >
              {item.cardLabel}
            </Button>
          </Grid>
          <Grid item xs={3} align="center">
            <Box size="small" color="primary">
              {myUtils.getHighestBid(item)}
            </Box>
          </Grid>
          <Grid item xs={1}>
            <Eth color="grey" />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const showProfile = async (_userAddress) => {
    let url = await myUtils.profileLink(_userAddress);
    window.open(url, "_self");
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* <ThemeProvider theme={rtlTheme}> */}
      <ThemeProvider>
        <CssBaseline />
        <Container id="back-to-top-anchor">
          <main>
            <Container
              maxWidth="md"
              sx={{ justifyContent: "center" }}
              disableGutters={true}
            >
              <Box
                mt={7}
                // fontSize={13}
                fontSize={15}
                fontWeight="fontWeightBold"
                sx={{ display: "flex", justifyContent: "center" }}
              >
                Wellcome to the digital words of NFT arts
                <br />
              </Box>
              <Box
                mt={2}
                mb={2}
                // fontSize={11}
                fontSize={13}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                After the first sale, NFTs can be sold on the other markets like
                OPENSEA
                <br />
              </Box>

              <Grid container display="flex" justifyContent="center">
                <Grid item xs={12}>
                  <Divider light={true} />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Grid
                    container
                    justifyContent="space-around"
                    alignItems="center"
                    // spacing={10}
                  >
                    <Grid item xs={6} sm={5} md={5} name="sortComponent">
                      <Grid
                        name="sortBox"
                        container
                        display="flex"
                        flexDirection="row"
                        justifyContent="flex-start"
                        alignItems="center"
                      >
                        <Grid item>
                          <SortRoundedIcon />
                        </Grid>

                        <Grid item>
                          <FormControl margin="dense" size="small">
                            <Select
                              value={sortType}
                              // displayEmpty
                              onChange={handleSortTypeChange}
                              sx={{ textAlign: "center" }}
                              // MenuProps={MenuProps}
                              // renderValue={(selected) => {
                              //   if (selected.length === 0) {
                              //     return <em>Choose a sort option</em>;
                              //   }

                              //   return selected;
                              // }}
                            >
                              {/* <MenuItem disabled value="">
                                <em>Choose a sort option</em>
                              </MenuItem> */}
                              <MenuItem value={"mostLiked"}>
                                Most favorite
                              </MenuItem>
                              <MenuItem value={"newest"}>Newest</MenuItem>
                              <MenuItem value={"oldest"}>Oldest</MenuItem>
                              <MenuItem value={"mostExpensive"}>
                                Most expensove
                              </MenuItem>
                              <MenuItem value={"cheapest"}>Cheapest</MenuItem>
                            </Select>
                            <Hidden mdDown>
                              <FormHelperText>
                                Please choose a sort option
                              </FormHelperText>
                            </Hidden>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={6} sm={7} md={7} name="SearchBox">
                      <SearchBox
                        searchData={[...artData]}
                        doSearch={doSearch}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Container>

            <div name="tabContainer" className={classes.tabGrid}>
              <Paper square>
                <Tabs
                  value={tabValue}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons
                  allowScrollButtonsMobile
                >
                  <Tab label="For sale" icon={<ShoppingBasketTwoToneIcon />} />
                  <Tab label="In Auction" icon={<FormatPaintTwoToneIcon />} />
                  <Tab label="Sold" icon={<ReceiptTwoToneIcon />} />
                  <Tab label="Not listed" icon={<DnsOutlinedIcon />} />
                  <Tab label="All" icon={<BorderAllRoundedIcon />} />
                </Tabs>
              </Paper>
            </div>

            <Container
              name="artList"
              className={classes.cardGrid}
              maxWidth="ld"
            >
              <Grid container spacing={3}>
                {cards.map((card) => (
                  <Grid item key={card} xs={12} sm={6} md={3}>
                    <Card
                      className={classes.card}
                      onMouseOver={() => toggleRaised(card)}
                      onMouseOut={() => toggleRaised(card)}
                      raised={raised[card]}
                    >
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                      >
                        <Button size="small" color="primary">
                          {!(artData[card]
                            ? artData[card].nft.liked
                            : false) ? (
                            <FavoriteBorderIcon
                              color="disabled"
                              onClick={() => onLike(card)}
                            />
                          ) : (
                            <FavoriteBorderIcon
                              color="secondary"
                              onClick={() => onLike(card)}
                            />
                          )}

                          <Typography variant="h6">
                            {artData[card] ? artData[card].nft.likes : 0}
                          </Typography>
                        </Button>
                      </Grid>

                      <Link
                        href={
                          artData[card]
                            ? window.location.protocol +
                              "//" +
                              window.location.hostname +
                              "/gallery/" +
                              artData[card].nft.jsonCid
                            : ""
                        }
                      >
                        {/* {loading[card] ? (
                            <Skeleton variant="rect" width="100%" height={300} />
                          ) : (
                            ""
                          )} */}
                        <CardMedia
                          align="center"
                          component={fileType(artData[card])}
                          className={classes.cardMedia}
                          image={imageOnIPFS(artData[card])}
                          title={artData[card] ? artData[card].nft.artName : ""}
                          onLoad={() => {
                            console.log("onload ...");
                            let t = [...loading];
                            t[card] = 0;
                            setLoading(t);
                          }}
                          autoPlay
                          controls
                        />
                      </Link>

                      <CardContent className={classes.cardContent}>
                        <Grid
                          container
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center"
                          dir="ltr"
                          spacing={1}
                        >
                          <Grid item>
                            <Box fontSize={15} fontWeight="fontWeightBold">
                              {artData[card]
                                ? artData[card].nft.artName.toUpperCase()
                                : ""}
                            </Box>
                          </Grid>
                          <Grid item>
                            <Link
                              dir="ltr"
                              style={{ fontSize: 10 }}
                              underline="none"
                              color="'textPrimary'"
                              // href=""
                              onClick={() =>
                                showProfile(artData[card].nft.userEthAddress)
                              }
                            >
                              by @
                              {artData[card]
                                ? artData[card].nft.artistName
                                : ""}
                            </Link>
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions>
                        {artData[card] ? cardActionsSection(artData[card]) : ""}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>

            <Backdrop
              className={classes.backdrop}
              open={openBackdrop}
              onClick={handleBackdropClose}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </main>
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
