import { useEffect, useState, useLayoutEffect, useContext } from "react";
import WalletButton from "./WalletButton";
import UserProfile from "./profile";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import SessionContext from "./sessionContext";

/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";
import { StylesProvider, } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { makeStyles } from "@mui/styles";
const useStyles = makeStyles((theme) => ({
  walletButton: {
    marginRight: theme.spacing(1),
  },
}));
/**-------end of RTL stuff------- */

const WalletProfile = (props) => {
  const classes = useStyles();

  const session = useContext(SessionContext);

  useLayoutEffect(() => {
    document.body.setAttribute("dir", "rtl");
  });

  return (
    <StylesProvider jss={rtlJss}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={rtlTheme}>
          {session.address ? <UserProfile /> : ""}
          <div className={classes.walletButton}>
            <WalletButton popUpWalletSignal={props.popUpWalletSignal} />
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  );
};

export default WalletProfile;
