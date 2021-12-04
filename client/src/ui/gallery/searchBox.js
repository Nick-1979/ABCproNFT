import React from "react";
import { makeStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    // padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    maxWidth: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
}));

export default function SearchBox(props) {
  const { t, i18n } = useTranslation(); 

  const classes = useStyles();
  const [searchItem, setSearchItem] = React.useState();

  function clearSearchBox() {
    setSearchItem("");
    props.doSearch("");
  }

  return (
    <Paper component="form" 
    // dir="rtl"
     fullwidth className={classes.root}>
      <IconButton disabeled className={classes.iconButton} aria-label="search" size="large">
        <SearchIcon onClick={()=> props.doSearch(searchItem)} />
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder='Search'
        value={searchItem}
        onChange={(e) => {
          setSearchItem(e.target.value.trim());
          props.doSearch(e.target.value.trim());
        }}
      />

      {searchItem ? (
        <IconButton
          onClick={clearSearchBox}
          className={classes.iconButton}
          aria-label="search"
          size="large">
          <ClearIcon />
        </IconButton>
      ) : (
        ""
      )}
    </Paper>
  );
}
