import React from "react";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import clsx from "clsx";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from "@mui/material";
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(14),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20,
  },
  details: {
    alignItems: "center",
  },
  headerName: {
    flexBasis: "30%",
  },
  headerTitle: {
    flexBasis: "70%",
  },
  column: {
    flexBasis: "33.33%",
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

export default function MoreInfo(props) {
  const classes = useStyles();

  function clearValues() {
    console.log("clearing ...");
    Array.from(document.querySelectorAll("input")).forEach(
      (input) => (input.value = "")
    );
    props.setMoreInfoData("");
  }
  return (
    <div className={classes.root}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header"
        >
          <div className={classes.headerName}>
            <Typography className={classes.heading}>
              More information
            </Typography>
          </div>
          <div className={classes.headerTitle}>
            <Typography className={classes.secondaryHeading}>
              These information can be set later
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <Grid container display="flex" flexDirection="row" spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                id="sellPrice"
                label="Sell price"
                type="number"
                size={"small"}
                color="secondary"
                placeholder="0.001"
                helperText="enter NFt price"
                fullWidth
                variant="outlined"
                onChange={(event) => {
                  let data = { ...props.moreInfoData };
                  data.reservePrice = event.target.value;
                  props.setMoreInfoData(data);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="royality"
                type="number"
                name="Royality"
                color="secondary"
                size={"small"}
                label="Royality"
                placeholder="10%"
                helperText="Maximum royality is 10%"
                fullWidth
                variant="outlined"
                onChange={(event) => {
                  let data = { ...props.moreInfoData };
                  data.royality = event.target.value;
                  props.setMoreInfoData(data);
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box mt={3} mb={3}>
                <FormControl component="fieldset">
                  <RadioGroup
                    margin="dense"
                    defaultValue="abcpro"
                    onChange={(event) => {
                      let data = { ...props.moreInfoData };
                      data.nftMarketAfterFirstSale = event.target.value;
                      props.setMoreInfoData(data);
                    }}
                  >
                    <FormControlLabel
                      label={
                        <Box fontSize={11} color="text.primary">
                          Remain in ABCPro after sale
                        </Box>
                      }
                      value="abcpro"
                      control={<Radio size="small" color="default" />}
                      style={{ fontSize: 10 }}
                    />
                    <FormControlLabel
                      value="opensea"
                      control={<Radio size="small" color="default" />}
                      label={
                        <Box fontSize={11} color="text.primary">
                          Transfer to OpenSea after sale
                        </Box>
                      }
                    />
                  </RadioGroup>
                  <FormHelperText>
                    Note, The options can not be changed after the first sale!
                  </FormHelperText>
                </FormControl>
              </Box>
            </Grid>

            <Box mt={1}>
              </Box>
          </Grid>
        </AccordionDetails>
        <Divider />
      </Accordion>
    </div>
  );
}
