import React from "react";
import {makeStyles } from "@mui/styles";
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyRoundedIcon from "@mui/icons-material/FileCopyRounded";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import DialpadRoundedIcon from "@mui/icons-material/DialpadRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { TwitterShareButton } from "react-share";
const useStyles = makeStyles((theme) => ({
  root: {
    height: 38,
    transform: "translateZ(0px)",
    flexGrow: 1,
  },
  speedDial: {
    position: "absolute",
    bottom: theme.spacing(0),
    right: theme.spacing(2),
    left: theme.spacing(0),
  },
}));

const actions = [
  { icon: <ReportProblemRoundedIcon />, name: "report", id: "report" },
  { icon: <ShareIcon />, name: "share", id: "share" },
  { icon: <FileCopyRoundedIcon />, name: "copy link", id: "copy" },
  { icon: <FavoriteIcon />, name: "like", id: "like" },
  { icon: <FullscreenIcon />, name: "fullscreen", id: "fullscreen" },
];

export default function ActionsButton(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleClick = (e, x) => {
    handleClose();

    switch (e) {
      case "fullscreen":
        props.handleFullscreen();
        break;
      case "copy":
        navigator.clipboard.writeText(window.location.href);
        break;
      case "share":
        let twitterBaseUrl = "https://twitter.com/intent/tweet?";
        let baseText = "text=Check%20out%20my%20new%20NFT%20on%20";
        let siteName = "ABCpro";
        let twitterId = "ABCproN";
        let link =
          twitterBaseUrl +
          baseText +
          siteName +
          "%21&url=" +
          window.location.href +
          "&via=" +
          twitterId;
        window.open(link, "_blank");
        break;
      default:
        break;
    }
  };
  return (
    <div className={classes.root}>
      <SpeedDial
        ariaLabel="SpeedDial"
        className={classes.speedDial}
        icon={
          <SpeedDialIcon
            icon={<DialpadRoundedIcon  />}
            openIcon={<MoreHorizIcon />}
          />
        }
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleClick(action.id)}
          />
        ))}
      </SpeedDial>
    </div>
  );
}
