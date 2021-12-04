import React from "react";
import styled from "styled-components";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
 import * as IconlyPack from "react-iconly";
import sessionContext from "../wallet/sessionContext";


//PAGES
import NewMint from "../mint/newMint";
import Gallery from "../gallery/gallery";
import SignUp from "../sign-up/SignUp";
import { IFrame as OpenseaFrame } from "../../utils/openseaFrame";
import UserProfile from "../profile/profile";
import ArtPage from "../artPage/ArtPage";

///ICONS
import SignUpIcon from "@mui/icons-material/BorderColorRounded";
import ContactUsIcon from "@mui/icons-material/ContactMailRounded";
import GalleryIcon from "@mui/icons-material/PermMediaRounded";
import EcoTwoToneIcon from "@mui/icons-material/EcoTwoTone";

/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";
import { StylesProvider, } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */

const TopMenu = () => {
  return (
    <div>
      <Router>
        <Switch>
          <Route path="/" component={Gallery} exact />
          <Route path="/mint" component={NewMint} exact />
          <Route path="/gallery" component={Gallery} exact />
          <Route path="/gallery/*" component={ArtPage} exact />
          <Route path="/collection" component={OpenseaFrame} exact />
          <Route path="/profile/*" component={UserProfile} exact />
          <Route path="/signup" component={SignUp} exact />
          <Redirect to="/" />
        </Switch>
      </Router>
    </div>
  );
};

const useOnClickOutside = (ref, handler) => {
  React.useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

export default TopMenu;
