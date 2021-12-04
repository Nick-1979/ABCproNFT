import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Link from "@mui/material/Link";
import { Box } from "@mui/material";
import { SocialIcon } from "react-social-icons";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import PropTypes from "prop-types";
import Zoom from "@mui/material/Zoom";
import Fab from "@mui/material/Fab";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";

import { StylesProvider, } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */
 
// Configure JSS


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

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://ibit.exchange/">
        abcpro.xyz
      </Link>{" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    paddingTop:theme.spacing(3)
  },
}));

export default function Footer(props) {
  const classes = useStyles();

  return (
    
          <footer className={classes.footer}>
            <Typography variant="h6" align="center" gutterBottom>
              ABC pro
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="textSecondary"
              component="p"
            >
              An NFT market for ERC721 and ERC1155-based art works on blockchin.
              <br />
              Buy, sell and discover proprietary digital assets
            </Typography>
            <Grid justifyContent="center" align="center">
              <Box mt={2} mb={1}>
                <SocialIcon
                  url="https://twitter.com/AbcproN"
                  target="_blank" rel="noopener noreferrer"
                  style={{ height: 35, width: 35 }}
                />
                <SocialIcon
                  url="https://www.instagram.com/ABCpro.ir"
                  target="_blank" rel="noopener noreferrer"
                  style={{ height: 35, width: 35 }}
                />
                <SocialIcon
                  network="facebook"
                  target="_blank" rel="noopener noreferrer"
                  style={{ height: 35, width: 35 }}
                />
                <SocialIcon
                  network="linkedin"
                  target="_blank" rel="noopener noreferrer"
                  style={{ height: 35, width: 35 }}
                />
                <SocialIcon
                  network="telegram"
                  target="_blank" rel="noopener noreferrer"
                  style={{ height: 35, width: 35 }}
                />
              </Box>
            </Grid>
            <Copyright />
            <ScrollTop {...props}>
              <Fab color="secondary" size="small" aria-label="scroll back to top">
                <KeyboardArrowUpIcon />
              </Fab>
            </ScrollTop>
         
          </footer>
       
  );
}
