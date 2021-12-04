import { useEffect, useState, useLayoutEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import MoreInfo from "./MoreInfo";
import { TextField, Avatar, Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import Container from "@mui/material/Container";
import Hidden from "@mui/material/Hidden";
import CardMedia from "@mui/material/CardMedia";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { red } from "@mui/material/colors";

import mintNFT from "../../utils/mintNFT.js";
import prepareNFT from "../../utils/prepareNFT";
import LoadingButton from "../../utils/loadingButton";
import Dropzone from "./dropZone";
import i18n from "i18next";
import SessionContext from "../wallet/sessionContext";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

import { useTranslation, initReactI18next } from "react-i18next";

import WalletProfile from "../wallet/WalletProfile";

/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";
import { StylesProvider } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: {
          "Connect Wallet": "Connect Wallet",
          Connected: "Connected",
          Description: "Description",
          artName: "Art name",
          artistName: "Artist name",
          "e.g. My first NFT!": "e.g. My first NFT!",
          "e.g. John Doe": "e.g. John Doe",
          "e.g. Even cooler than cryptokitties ;)":
            "e.g. Even cooler than cryptokitties",
          "Connect to Metamask using the top right button.":
            "Connect to Metamask using the top right button.",
        },
      },
    },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

const useStyles = makeStyles((theme) => ({
  TitleText: {
    // color: "green",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    fontSize: 13,
  },
  newMintText: {
    color: "green",
    fontSize: 14,
    fontWeight: 600,
  },
  textFieldFont: {
    color: "pink",
    fontSize: 12,
  },
  optionText: {
    color: "black",
    fontSize: 12,
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  logo: {
    height: 100,
    width: 100,
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
}));

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const Minter = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const session = useContext(SessionContext);

  const [artName, setArtName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [description, setDescription] = useState("");
  const [mintNFTButtonIsDisabeled, setMintNFTButtonIsDisabeled] =
    useState(true);
  const [selectedFile, setSelectedFile] = useState();
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [optionValue, setOptionValue] = useState("toGallery");
  const [moreInfoData, setMoreInfoData] = useState({
    reservePrice: 0,
    royality: 0,
  });

  useEffect(() => {
    session.address &&
    selectedFile &&
    artName &&
    artistName &&
    description &&
    optionValue
      ? setMintNFTButtonIsDisabeled(false)
      : setMintNFTButtonIsDisabeled(true);
  }, [
    selectedFile,
    artName,
    artistName,
    description,
    optionValue,
    session.address,
  ]);

  useEffect(() => {
    handleArtistName();
  }, [session.profile]);

  const setExtraAttributes = () => {
    return [
      {
        trait_type: "Artist Name",
        value: artistName,
      },
      {
        trait_type: "Artist ETH Address",
        value: session.address,
      },
      // {
      //   trait_type: "Reserve Price",
      //   value: moreInfoData.reservePrice,
      // },
      // {
      //   trait_type: "Royality",
      //   value: moreInfoData.royality,
      // },
    ];
  };

  function checkIsEnglish(element) {
    let char = new RegExp("[\u0600-\u06FF]");
    if (char.test(element) === true) {
      return false;
    } else {
      return true;
    }
  }

  const doMint = async () => {
    if (session.address) {
      let extraAttributes = setExtraAttributes();
      setLoading(true);

      //TODO: rewrite to use metamask provider
      const res = await mintNFT(
        selectedFile,
        artName,
        description,
        extraAttributes,
        moreInfoData.reservePrice,
        moreInfoData.royality
      );
      let variant = res.success ? "success" : "error";

      if (res.success) {
        setImgUrl(res.imgUrl);
        setLoading(false);
      }
    } else {
      session.setAlert({
        text: "connect your Wallet using connect button on top right",
        variant: "info",
      });
    }
  };

  function openUrl(url) {
    const win = window.open(url, "_self");
  }

  const sendToGallery = async () => {
    if (session.address) {
      let extraAttributes = setExtraAttributes();
      setLoading(true);
      const res = await prepareNFT(
        selectedFile,
        artName,
        description,
        extraAttributes,
        moreInfoData.reservePrice,
        moreInfoData.royality,
        moreInfoData.nftMarketAfterFirstSale,
        false
      );
      let variant = res.success ? "success" : "error";
      session.setAlert({ text: res.status, variant: variant });

      setLoading(false);
      console.log(res.jsonCid);
      if (res.jsonCid) {
        let newPath = "/gallery/" + res.jsonCid;
        openUrl(newPath);
      }
    } else {
      session.setAlert({
        text: "connect your Wallet using connect button on top right",
        variant: "info",
      });
    }
  };

  const handleMinting = () => {
    if (moreInfoData.royality > 10 || moreInfoData.royality < 0) {
      alert("Maximum royality is 10");

      return;
    }
    if (optionValue === "toGallery") {
      sendToGallery();
    } else if (optionValue === "mint") {
      doMint();
    } else {
      console.log("strage option value :", optionValue);
    }
  };

  const handleRadioChange = (e) => {
    setOptionValue(e.target.value);
    console.log(e.target.value);
  };

  const handleArtistName = () => {
    if (!session.profile) return;
    let name =
      capitalizeFirstLetter(session.profile.fName) +
      "  " +
      capitalizeFirstLetter(session.profile.lName);
    setArtistName(name);
    return name;
  };

  return (
    <div>
      <Container maxWidth="lg" id="back-to-top-anchor">
        <Box mb={3}>
          <Grid container display="flex" flexDirection="row">
            <Hidden smDown>
              {" "}
              <Grid item xs={12} md={6}>
                <Grid
                  container
                  display="flex"
                  justifyContent="flex-end"
                  flexDirection="row"
                  alignItems="center"
                >
                  <Grid item xs={4} md={2}>
                    <Box align="right">
                      <CardMedia
                        className={classes.logo}
                        image="./images/mint5.png"
                        title="Abcpro icon"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={8} md={10}>
                    <Box
                      fontWeight="fontWeightBold"
                      fontSize={15}
                      align="right"
                    >
                      New mint
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Hidden>
            <Grid item xs={12} md={6}></Grid>
          </Grid>

          <Grid
            container
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Grid item xs={12} sm={6}>
              <Grid container display="flex" flexDirection="row" spacing={3}>
                <Grid item xs={12} sm={12}>
                  <Box className={classes.TitleText}>
                    The following info will be used on different markets
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    id="artName"
                    autoFocus={true}
                    label="artName"
                    size={"small"}
                    required
                    autoComplete="off"
                    placeholder="e.g. My first NFT!"
                    helperText="  Enter the art name"
                    fullWidth
                    variant="outlined"
                    value={artName}
                    onChange={(e) => {
                      if (checkIsEnglish(e.target.value))
                        setArtName(e.target.value);
                      else
                        setArtName(
                          e.target.value.replace(/[^a-zA-Z0-9]/gi, "")
                        );
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl
                    required
                    fullWidth
                    size={"small"}
                    variant="outlined"
                  >
                    <InputLabel>Art type</InputLabel>
                    <Select
                      labelId="art-type-select-label"
                      id="art-type-select"
                      label="Art type "
                    >
                      <MenuItem value={"picture"}>Picture</MenuItem>
                      <MenuItem value={"motionPicture"}>
                        Motion picture
                      </MenuItem>
                      <MenuItem value={"photo"}>Photo</MenuItem>
                      <MenuItem value={"music"}>Music</MenuItem>
                    </Select>
                    <FormHelperText>Choose art type</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    id="artistName"
                    name="Artist Name"
                    label="Artist name"
                    size={"small"}
                    required
                    dir="ltr"
                    InputLabelProps={{ shrink: true }}
                    placeholder={session.profile ? artistName : "e.g. John Doe"}
                    disabled={session.profile ? true : false}
                    helperText={session.profile ? "" : "  Enter your name"}
                    fullWidth
                    variant="outlined"
                    value={artistName}
                    onChange={(e) => {
                      if (checkIsEnglish(e.target.value))
                        setArtistName(e.target.value);
                      else
                        setArtistName(
                          e.target.value.replace(/[^a-zA-Z]/gi, "")
                        );
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    required
                    label="Description"
                    size={"small"}
                    dir="ltr"
                    placeholder="e.g. Even cooler than cryptokitties ;)"
                    helperText="  Description of your art"
                    fullWidth
                    multiline={true}
                    rows={3}
                    maxRows={10}
                    margin="normal"
                    variant="outlined"
                    value={description}
                    onChange={(e) => {
                      if (checkIsEnglish(e.target.value))
                        setDescription(e.target.value);
                      else
                        setDescription(
                          e.target.value.replace(/[^a-zA-Z0-9]/gi, "")
                        );
                    }}
                  />
                </Grid>
              </Grid>
              <Box mt={2}>
                <MoreInfo
                  moreInfoData={moreInfoData}
                  setMoreInfoData={setMoreInfoData}
                />
              </Box>
              <Box pt={4} display="flex" justifyContent="space-around">
                <LoadingButton
                  caption="Confirm"
                  loading={loading}
                  disabled={mintNFTButtonIsDisabeled}
                  onClick={handleMinting}
                />
              </Box>
              {!session.address ? (
                <Box
                  mt={1}
                  fontSize={12}
                  align="center"
                  style={{ color: red[500] }}
                >
                  <WarningRoundedIcon color="secondary" />
                  Wallet should be connected to be able to mint
                </Box>
              ) : (
                ""
              )}
            </Grid>
            <Grid item xs={12} sm={5}>
              <Box m={3} pt={3}>
                <Dropzone setSelectedFile={setSelectedFile} />
              </Box>
              <Box m={3}>
                <Typography
                  variant="subtitle2"
                  align="left"
                  color="textSecondary"
                >
                  Maximum file size should be 40 Mb
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default Minter;
