import "./App.css";

import { createMuiTheme } from "@mui/material/styles";

import { makeStyles } from "@mui/styles";

import { StylesProvider } from "@mui/styles";

import { useLayoutEffect, useState, useEffect } from "react";
import { SessionProvider } from "./ui/wallet/sessionContext";
import { SnackbarProvider, useSnackbar } from "notistack";
import Footer from "./ui/footer/footer";
import { Grid, Box, Container } from "@mui/material";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import { IconButton } from "@mui/material";
import { lime } from "@mui/material/colors";
import MenuBar from "./ui/menu/menuBar";

/**  * RTL stuff */
import { rtlTheme, cacheRtl } from "./utils/rtl";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createMuiTheme();
const useStyles = makeStyles((theme) => {
  root: {
    // some css that access to theme
  }
});

function App() {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [signer, setSigner] = useState(null);
  const [topMenuVal, setTopMenuVal] = useState(null);

  const [provider, setProvider] = useState(null);
  const [demoAlert, setDemoAlert] = useState();
  const { enqueueSnackbar } = useSnackbar();
  const handleNotification = (note, variant) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(note, { variant });
  };

  var session = {
    address: address,
    setAddress: setAddress,
    chainId: chainId,
    setChainId: setChainId,
    alert: alert,
    setAlert: setAlert,
    profile: profile,
    setProfile: setProfile,
    balance: balance,
    setBalance: setBalance,
    signer: signer,
    setSigner: setSigner,
    provider: provider,
    setProvider: setProvider,
    topMenuVal: topMenuVal,
    setTopMenuVal: setTopMenuVal,
  };
  useEffect(() => {
    if (alert) {
      handleNotification(session.alert.text, session.alert.variant);
    }
  }, [alert]);

  useLayoutEffect(() => {
    document.body.setAttribute("dir", "rtl");
    setDemoAlert(true);
  }, []);

  const handleDemoAlert = () => {
    window.alert("notice you are in demo mode");
    setDemoAlert(false);
  };

  return (
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        {
          //chainId !== "0x1" &&
          demoAlert ? (
            <Container maxWidth="sm" align="center">
              <Box
                bgcolor="secondary.main"
                color="secondary.contrastText"
                borderRadius="8px"
                width="75%"
              >
                <Grid container>
                  <Grid item xs={10} md={8}>
                    <Box
                      mt={2}
                      fontWeight="fontWeightBold"
                      fontSize={11}
                      align="center"
                      dir="rtl"
                    >
                      Demo: You are on Rinkeby in demo mode
                    </Box>
                  </Grid>
                  <Grid item xs={2} md={2} align="center">
                    <IconButton
                      color="primary"
                      onClick={handleDemoAlert}
                      size="large"
                    >
                      <CancelPresentationRoundedIcon
                        fontSize="medium"
                        style={{ color: lime[100] }}
                      />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          ) : (
            ""
          )
        }
        <SessionProvider value={session}>
          {/* <Container>
          <WalletProfile maxWidth="md" />
        </Container> */}
          <MenuBar />
          {/* <MenuRtl />  */}

          <Footer />
        </SessionProvider>
      </SnackbarProvider>
    </div>
  );
}

export default function IntegrationWithNotistack() {
  const classes = useStyles();

  return (
    // <div dir="rtl">
    <div dir="ltr">
      <StyledEngineProvider injectFirst>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={rtlTheme}>
            <SnackbarProvider maxSnack={3}>
              <App />
            </SnackbarProvider>
          </ThemeProvider>
        </CacheProvider>
      </StyledEngineProvider>
    </div>
  );
}
