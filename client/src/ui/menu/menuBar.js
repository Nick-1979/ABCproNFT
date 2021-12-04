import React from "react";
import SessionContext from "../wallet/sessionContext";
import { useTranslation } from "react-i18next";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
//PAGES
import NewMint from "../mint/newMint";
import Gallery from "../gallery/gallery";
import SignUp from "../sign-up/SignUp";
import { IFrame as OpenseaFrame } from "../../utils/openseaFrame";
import UserProfile from "../profile/profile";
import ArtPage from "../artPage/ArtPage";

import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import {
  MenuItem,
  Link,
  Paper,
  Tabs,
  Tab,
  TextField,
  CardMedia,
  Hidden,
  Box,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import WalletProfile from "../wallet/WalletProfile";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
    // paddingBottom: theme.spacing(2)
  },
  menuButton: {
    marginLeft: theme.spacing(2),
  },
  tabLabel: { fontSize: 14, fontWeight: "bold" },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  logo: {
    height: 25,
    width: 64,
  },
  menuLabel: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    borderColor: "text.primary",
  },

  // search: {
  //   position: "relative",
  //   borderRadius: theme.shape.borderRadius,
  //   backgroundColor: alpha(theme.palette.common.white, 0.15),
  //   "&:hover": {
  //     backgroundColor: alpha(theme.palette.common.white, 0.25),
  //   },
  //   marginRight: theme.spacing(2),
  //   marginLeft: 0,
  //   width: "100%",
  //   [theme.breakpoints.up("sm")]: {
  //     marginLeft: theme.spacing(3),
  //     width: "auto",
  //   },
  // },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.09),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.black, 0.07),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
  },
  inputRoot: {
    color: "inherit",
  },
  // inputInput: {
  //   padding: theme.spacing(1, 1, 1, 0),
  //   // vertical padding + font size from searchIcon
  //   paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  //   transition: theme.transitions.create("width"),
  //   width: "100%",
  //   [theme.breakpoints.up("md")]: {
  //     width: "20ch",
  //   },
  // },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

export default function MenuBar() {
  const { t, i18n } = useTranslation();

  const classes = useStyles();
  const session = React.useContext(SessionContext);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const [url, setUrl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  React.useEffect(() => {
    let url = window.location.pathname;
    if (url.includes("mint")) session.setTopMenuVal(1);
    else if (url.includes("collection")) session.setTopMenuVal(2);
    else if (url.includes("signup")) session.setTopMenuVal(3);
    else if (url.includes("gallery")) session.setTopMenuVal(0);
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleTabChange = (event, newValue) => {
    session.setTopMenuVal(newValue);
    //

    // window.open(url , "_self");
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const logoUrl =
    window.location.protocol +
    "//" +
    window.location.hostname +
    "/images/ABCpro.png";

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton aria-label="show 4 new mails" color="inherit" size="large">
          <Badge badgeContent={4} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          aria-label="show 11 new notifications"
          color="inherit"
          size="large"
        >
          <Badge badgeContent={11} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          size="large"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="fixed" color="inherit">
        <Toolbar variant="dense">
          <Hidden smUp>
            <IconButton
              edge="end"
              className={classes.menuButton}
              color="inherit"
              aria-label="open drawer"
              size="large"
            >
              <MenuIcon ontSize="large" />
            </IconButton>
          </Hidden>
          <Link href={"/"}>
            <CardMedia
              className={classes.logo}
              image={logoUrl}
              title="Abcpro icon"
            />
          </Link>
          <Hidden smDown name="tabContainer" className={classes.grow}>
            <Tabs
              value={session.topMenuVal}
              indicatorColor="secondary"
              textColor="inherit"
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons
              selectionFollowsFocus={true}
              allowScrollButtonsMobile
            >
              <Link underline="none" color="inherit" href="/gallery">
                <Box
                  align="center"
                  fontSize={14}
                  fontWeight="fontWeightBold"
                  className={classes.menuLabel}
                >
                  Gallery
                </Box>
              </Link>{" "}
              <Link underline="none" color="inherit" href="/mint">
                <Box
                  align="center"
                  fontSize={14}
                  fontWeight="fontWeightBold"
                  className={classes.menuLabel}
                >
                  Mint
                </Box>
              </Link>
              <Link underline="none" color="inherit" href="/collection">
                <Box
                  align="center"
                  fontSize={14}
                  className={classes.menuLabel}
                  fontWeight="fontWeightBold"
                >
                  Collection
                </Box>
              </Link>
              <Link underline="none" color="inherit" href="/signup">
                <Box
                  align="center"
                  fontSize={14}
                  className={classes.menuLabel}
                  fontWeight="fontWeightBold"
                >
                  Signup
                </Box>{" "}
              
              </Link>
            </Tabs>
          </Hidden>
          <Box sx={{ flexGrow: 1 }} />

        
          <WalletProfile className={classes.sectionDesktop} />
        </Toolbar>
      </AppBar>

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
}
