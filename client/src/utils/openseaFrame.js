import React, { useRef, useState } from "react";
import IframeResizer from "iframe-resizer-react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Zoom from "@mui/material/Zoom";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Fab from "@mui/material/Fab";
import PropTypes from "prop-types";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const testCollectionURL =
  process.env.REACT_APP_OPENSEA_BASE_URL +
  process.env.REACT_APP_OPENSEA_COLLECTION_URL +
  "?embed=true";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBarSpacer: theme.mixins.toolbar,

  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

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

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
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

export const IFrame = (props) => {
  const classes = useStyles();
  const iframeRef = useRef(null);
  const [messageData, setMessageData] = useState();

  const onResized = (data) => setMessageData(data);

  const onMessage = (data) => {
    setMessageData(data);
    iframeRef.current.sendMessage("Hello back from the parent page");
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <IframeResizer
        forwardRef={iframeRef}
        heightCalculationMethod="lowestElement"
        inPageLinks
        log
        // bodyBackground='#f11313'
        frameBorder="0"
        onMessage={onMessage}
        onResized={onResized}
        src={testCollectionURL}
        style={{ height: "100%", width: "100px", minWidth: "100%" }}
      />
      <ScrollTop {...props}>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </Container>
  );
};
