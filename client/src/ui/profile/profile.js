import { useState, useEffect, useContext } from "react";
import { useMediaQuery } from "react-responsive";

import { rtlJss, rtlTheme } from "../../utils/rtl";
// import WalletContext from "../wallet/walletContext";
import { Eth } from "@rimble/icons"; ///   cryptocurrency-icons
import { StylesProvider } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { green } from "@mui/material/colors";
import Globals from "../../utils/globals";
import {
  Box,
  Paper,
  Avatar,
  Container,
  Grid,
  Tabs,
  Tab,
  Divider,
  Card,
  Typography,
  Link,
  CardMedia,
  CardContent,
  Tooltip,
  IconButton,
  Hidden,
  CardActions,
  Button,
} from "@mui/material";
import {
  FileCopyTwoTone as FileCopyTwoToneIcon,
  Favorite as FavoriteIcon,
  AlbumRounded as AlbumRoundedIcon,
  CollectionsRounded as CollectionsRoundedIcon,
  DoneRounded as DoneRoundedIcon,
  ArrowForwardRounded as ArrowForwardRoundedIcon,
  ArrowBackRounded as ArrowBackRoundedIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  EmailOutlined as EmailOutlinedIcon,
  FormatPaintTwoTone as FormatPaintTwoToneIcon,
} from "@mui/icons-material";

import { makeStyles } from "@mui/styles";
import WalletProfile from "../wallet/WalletProfile";
import myUtils from "../../utils/general";

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },

  cardContent: {
    flexGrow: 1,
  },
  tabsRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    marginBottom: theme.spacing(5),
    marginTop: theme.spacing(4),
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    align: "left",
  },
  labelContainer: {
    width: "auto",
    padding: 0,
  },
  iconLabelWrapper: {
    flexDirection: "row",
    justifyContent: "start",
  },
}));

export default function Profile() {
  const classes = useStyles();
  const [userInfo, setUserInfo] = useState();
  const [userPhoto, setUserPhoto] = useState();
  const [createdNfts, setCreatedNfts] = useState([]);
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [favoriteNfts, setFavoriteNfts] = useState([]);
  const [myBids, setMyBids] = useState([]);

  const [tabValue, setTabValue] = useState(0);

  const [cards, setCards] = useState([]);
  const [artData, setArtData] = useState();
  const [raised, setRaised] = useState([]);
  const [hideLabel, setHideLabel] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const [userEthAddress, setUserEthAddress] = useState(null);

  const isMobile = useMediaQuery({ query: `(max-width: 770px)` });

  useEffect(() => {
    const getlastPartFromURL = (thePath) =>
      thePath.substring(thePath.lastIndexOf("/") + 1);

    const userAddress_id = getlastPartFromURL(window.location.href);
    async function func() {
      let userInfo = await myUtils.getUserProfile(userAddress_id);
      console.log("userInfo:::::", userInfo);
      if (userInfo) {
        let src = `data:${
          userInfo.profilePhoto.contentType
        };base64,${Buffer.from(userInfo.profilePhoto.data).toString("base64")}`;

        setUserPhoto(src);
        setUserInfo(userInfo);
        setUserEthAddress(userInfo.userEthAddress);
        console.log(userInfo);
      } else {
        //for non signed up buyers
        if (userAddress_id.startsWith("0x") || userAddress_id.startsWith("0X"))
          setUserEthAddress(userAddress_id);
        console.log("something went wrong to get useInfo");
      }
    }
    func();
  }, []);

  useEffect(() => {
    if (!userEthAddress) return;

    getCreatedNfts();
    getOwnedNfts();
    getFavoriteNfts();
    getMyBids();
  }, [userEthAddress]);

  const defaultTabValue = 0;
  useEffect(() => {
    if (!createdNfts || !ownedNfts || !favoriteNfts) {
      console.log("no  created NFTs");
      return;
    }
    handleTabChange(null, defaultTabValue);
  }, [createdNfts, ownedNfts, favoriteNfts]);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let fileType = (item) => {
    if (item) {
      return item.fileType.includes("video") ? "video" : "img";
    } else return "img";
  };

  const imageOnIPFS = (item) => {
    if (item) {
      return "https://" + item.artCid + process.env.REACT_APP_IPFS_GATEWAY;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (!createdNfts) {
      console.log("no userEthAddress in switch");
      return;
    }
    switch (newValue) {
      case 0:
        setArtData(createdNfts);
        setCards(Array.from(Array(createdNfts.length).keys()));
        break;
      case 1:
        setArtData(ownedNfts);
        setCards(Array.from(Array(ownedNfts.length).keys()));
        break;
      case 2:
        setArtData(favoriteNfts);
        setCards(Array.from(Array(favoriteNfts.length).keys()));
        break;
      default:
        setArtData(createdNfts);
        setCards(Array.from(Array(createdNfts.length).keys()));
    }
  };
  function toggleRaised(_index) {
    let temp = [...raised];
    temp[_index] = !temp[_index];
    setRaised(temp);
  }

  const getCreatedNfts = async () => {
    let result = await myUtils.postData("getCreatedNftsOf", {
      userEthAddress: userEthAddress,
    });
    console.log(
      "getCreatedNftsOfgetCreatedNftsOfgetCreatedNftsOfgetCreatedNftsOf:",
      result
    );
    if (result) {
      result.map((item) => (item.cardLabel = myUtils.prepareCardLabels(item)));

      setCreatedNfts([...result]);
    }
    console.log("CreatedNfts: ", result);
  };

  const getOwnedNfts = async () => {
    // if (!userInfo) return;
    let result = await myUtils.postData("getOwnedNftsOf", {
      userEthAddress: userEthAddress,
    });
    if (result) {
      result.map((item) => (item.cardLabel = myUtils.prepareCardLabels(item)));

      setOwnedNfts([...result]);
    }
    console.log("ownedNFTs: ", result);
  };

  const getFavoriteNfts = async () => {
    // if (!userInfo) return;
    let result = await myUtils.postData("getFavoriteNfts", {
      userEthAddress: userEthAddress,
    });
    if (result) {
      result.map((item) => (item.cardLabel = myUtils.prepareCardLabels(item)));

      setFavoriteNfts([...result]);
    }
  };

  const getMyBids = async () => {
    // if (!userInfo) return;
    let result = await myUtils.postData("getMyBids", {
      userEthAddress: userEthAddress,
    });
    if (result) {
      result.map((item) => (item.cardLabel = myUtils.prepareCardLabels(item)));

      setFavoriteNfts([...result]);
    }
  };

  const makeDate = (_date) => {
    const date = new Date(_date);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    // alert(month)
    return month + " " + year;
  };

  const makeAddressShort = (_address) => {
    _address = myUtils.toChecksumAddress(_address);

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
  };

  const copyAddress = () => {
    let address = myUtils.toChecksumAddress(userInfo.userEthAddress);
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(setAddressCopied, 3000, false);
  };

  const hideTabsLabel = () => {
    setHideLabel(!hideLabel);
  };

  const makeUserNetworkLink = (_network) => {
    if (!userInfo) return;

    switch (_network) {
      case "twitter":
        if (!userInfo.twitterId) return;
        return "https://twitter.com/" + userInfo.twitterId.replace("@", "");
      case "instagram":
        if (!userInfo.instagramId) return;
        return (
          "https://www.instagram.com/" + userInfo.instagramId.replace("@", "")
        );
      case "email":
        if (!userInfo.instagramId) return;
        return "mailto:" + userInfo.email;
      default:
        return;
    }
  };

  const cardActionsSection = (item) =>
    item.nft.auctionId
      ? cardActionsSectionWithAuctionId(item)
      : cardActionsSectionWithOutAuctionId(item);

  const cardActionsSectionWithOutAuctionId = (item) => (
    <Grid container direction="row" alignItems="center">
      <Grid item xs={9}>
        <Button
          color="primary"
          style={{ fontSize: 10 }}
          onClick={() => myUtils.showArtPage(item.nft)}
        >
          {item.cardLabel}
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Box size="small" color="primary">
          {item.nft ? (item.reservePrice ? item.reservePrice : "0.0") : "0.0"}
        </Box>
      </Grid>
      <Grid item xs={1}>
        <Eth />
      </Grid>
    </Grid>
  );

  const cardActionsSectionWithAuctionId = (item) => {
    return item.status === Globals.NFT_STATUS.SETTLED ? (
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
          <Grid item xs={6} align="left">
            <Button
              style={{
                color: "#FFFFFF",
                fontSize: 10,
              }}
              onClick={() => myUtils.showArtPage(item.nft)}
            >
              {item.cardLabel}
            </Button>
          </Grid>
          <Grid item xs={4} align="center">
            <Box size="small" color="primary">
              {myUtils.getHighestBid(item)}
            </Box>
          </Grid>
          <Grid item xs={2}>
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
          <Grid item xs={6} align="left">
            <Button
              style={{
                color: "#FFFFFF",
                fontSize: 10,
              }}
              onClick={() => myUtils.showArtPage(item.nft)}
            >
              {item.cardLabel}
            </Button>
          </Grid>
          <Grid item xs={4} align="center">
            <Box size="small" color="primary">
              {myUtils.getHighestBid(item)}
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Eth color="grey" />
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Container
    // maxWidth="md"
    >
      {/* <Container>
              <WalletProfile maxWidth="md" />
            </Container> */}

      <div align="center">
        <Container maxWidth="md">
          <Box mt={3}>
            <Avatar
              alt="artist"
              src={userPhoto}
              sx={{ width: 70, height: 70 }}
            />
          </Box>
          <Grid container align="center">
            <Grid item xs={12}>
              <Box mt={3} fontSize={20} fontWeight="fontWeightBold">
                {userInfo ? capitalizeFirstLetter(userInfo.fName) : "Unknown"}
                {"  "}
                {userInfo ? capitalizeFirstLetter(userInfo.lName) : ""}
              </Box>
              <Box mt={3} fontSize={13} fontWeight="fontWeightBold">
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item>
                    <Tooltip title="Copy address">
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        onClick={copyAddress}
                        size="large"
                      >
                        {!addressCopied ? (
                          <FileCopyTwoToneIcon color="action" />
                        ) : (
                          <DoneRoundedIcon style={{ color: green[500] }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    {userInfo ? makeAddressShort(userInfo.userEthAddress) : ""}
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} align="center">
              <Box my={1} fontSize={13} dir="ltr">
                {userInfo ? userInfo.bio : ""}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={2}>
                <Grid item>
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    href={userInfo ? makeUserNetworkLink("instagram") : ""}
                  >
                    <Box fontSize={12} align="center" dir="ltr">
                      <InstagramIcon /> {userInfo ? userInfo.instagramId : ""}
                    </Box>{" "}
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    href={userInfo ? makeUserNetworkLink("twitter") : ""}
                  >
                    <Box fontSize={12} align="center" dir="ltr">
                      <TwitterIcon />
                      {userInfo ? userInfo.twitterId : ""}
                    </Box>
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    href={userInfo ? makeUserNetworkLink("email") : ""}
                  >
                    <Box fontSize={12} align="center" dir="ltr">
                      <EmailOutlinedIcon />
                      {userInfo ? userInfo.email : ""}
                    </Box>{" "}
                  </Link>
                </Grid>
                <Grid item xs={12}>
                  <Box fontSize={11} align="center">
                    <b>Membership:</b>{" "}
                    {userInfo ? makeDate(userInfo.accountCreationDate) : ""}{" "}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </div>
      {/* <Divider /> */}
      <Container maxWidth="lg">
        <div className={classes.tabsRoot}>
          <Grid container direction="row">
            <Grid item xs={12} md={hideLabel ? 1 : 2}>
              <Grid container>
                <Grid item xs={12}>
                  <Hidden mdDown>
                    <Grid container>
                      <Grid item xs={9} align="center">
                        <Box m={2} fontSize={13} fontWeight="fontWeightBold">
                          Arts
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box mt={1}>
                          <IconButton
                            component="span"
                            onClick={hideTabsLabel}
                            size="large"
                          >
                            {hideLabel ? (
                              <ArrowForwardRoundedIcon />
                            ) : (
                              <ArrowBackRoundedIcon />
                            )}
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Hidden>
                </Grid>
                <Grid item xs={12}>
                  <Tabs
                    orientation={isMobile ? "horizontal" : "vertical"}
                    variant="scrollable"
                    value={tabValue}
                    onChange={handleTabChange}
                    className={classes.tabs}
                  >
                    <Tab
                      label={
                        hideLabel
                          ? "(" + createdNfts.length + ")"
                          : "Created   (" + createdNfts.length + ")"
                      }
                      classes={{
                        wrapper: classes.iconLabelWrapper,
                        labelContainer: classes.labelContainer,
                      }}
                      icon={<AlbumRoundedIcon />}
                    />
                    <Tab
                      label={
                        hideLabel
                          ? "(" + ownedNfts.length + ")"
                          : "Bought   (" + ownedNfts.length + ")"
                      }
                      classes={{
                        wrapper: classes.iconLabelWrapper,
                        labelContainer: classes.labelContainer,
                      }}
                      icon={<CollectionsRoundedIcon />}
                    />
                    <Tab
                      classes={{
                        wrapper: classes.iconLabelWrapper,
                        labelContainer: classes.labelContainer,
                      }}
                      label={
                        hideLabel
                          ? "(" + favoriteNfts.length + ")"
                          : "Favorates     (" + favoriteNfts.length + ")"
                      }
                      icon={<FavoriteIcon />}
                    />

                    <Tab
                      classes={{
                        wrapper: classes.iconLabelWrapper,
                        labelContainer: classes.labelContainer,
                      }}
                      label={
                        hideLabel
                          ? "(" + myBids.length + ")"
                          : "in auctions   (" + myBids.length + ")"
                      }
                      icon={<FormatPaintTwoToneIcon />}
                    />
                  </Tabs>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={hideLabel ? 11 : 10}>
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
                        ></Grid>

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
                          <CardMedia
                            align="center"
                            component={fileType(artData[card].nft)}
                            className={classes.cardMedia}
                            image={imageOnIPFS(artData[card].nft)}
                            title={
                              artData[card] ? artData[card].nft.artName : ""
                            }
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
                          {artData[card]
                            ? cardActionsSection(artData[card])
                            : ""}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Grid>
          </Grid>
        </div>
      </Container>
    </Container>
  );
}
