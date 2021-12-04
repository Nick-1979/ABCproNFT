import React, { useEffect, useCallback } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { withStyles } from "@mui/styles";

import Container from "@mui/material/Container";
import WalletProfile from "../wallet/WalletProfile";
import { DropzoneDialog } from "material-ui-dropzone";
import SessionContext from "../wallet/sessionContext";
import myUtils from "../../utils/general";

/**  * RTL stuff */
import { rtlTheme, cacheRtl } from "../../utils/rtl";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  DropzoneText: {
    fontSize: 11,
  },
  receiveNews: {
    label: {
      fontSize: 11,
    },
  },
}));

const ValidationTextField = withStyles({
  root: {
    "& input:valid + fieldset": {
      borderColor: "green",
      borderWidth: 2,
    },
    "& input:invalid + fieldset": {
      borderColor: "red",
      borderWidth: 2,
    },
    "& input:valid:focus + fieldset": {
      borderLeftWidth: 6,
      padding: "4px !important", // override inline-style
    },
  },
})(TextField);

export default function SignUp() {
  const classes = useStyles();
  const [submitButtonDisabled, setSubmitButtonDisabeld] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef(null);

  const [fName, setFName] = React.useState();
  const [lName, setLName] = React.useState();
  const [tel, setTel] = React.useState();
  const [email, setEmail] = React.useState();
  const [twitterId, setTwitterId] = React.useState();
  const [instagramId, setInstagramId] = React.useState();
  const [receiveNews, setReceiveNews] = React.useState(true);
  const [bio, setBio] = React.useState();
  const [userId, setUserId] = React.useState();
  const [userIdNotUniqueness, setUserIdNotUniqueness] = React.useState(false);

  const [profilePhoto, setProfilePhoto] = React.useState();

  const session = React.useContext(SessionContext);

  const handleSubmitForm = async (e) => {
    if (session.address) {
      let formData = new FormData(formRef.current);
      // for (var [key, value] of formData.entries()) {
      //   console.log(key, value);
      //  }
      formData.append("receiveNews", receiveNews);
      formData.append("profilePhoto", profilePhoto);
      formData.append("userEthAddress", session.address);
      // if (!formData.has("userID")) formData.append("userId", userId);

      let textToBeSigned = "Confirm ABC pro registration";
      // nonce:" + session.nonce;
      formData.append("textToBeSigned", textToBeSigned);

      let signature = await myUtils.signByMetamask(textToBeSigned);
      formData.append("signature", signature);

      let signUpUrl =
        window.location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        process.env.REACT_APP_API_SERVER_PORT +
        "/posts/signup";

      let response = await fetch(signUpUrl, {
        method: "POST",
        body: formData,
      });

      let result = await response.json();

      if (!result) {
        session.setAlert({
          text: "Something went wrong while signing up",

          variant: "warning",
        });
        return;
      }

      if (result.success) {
        setSubmitButtonDisabeld(true);

        setTimeout(function () {
          window.location.reload(); //reload page
        }, 3000);

        session.setAlert({
          text: result.text,
          variant: "success",
        });
      } else {
        session.setAlert({
          text: result.text,
          variant: "warning",
        });
      }
    }
  };

  const checkUserIdUniqueness = async (_userId) => {
    console.log("checkUserIdUniqueness userId", _userId);

    if (!_userId) {
      console.log("check user id uniqueness but user id is null");
      return;
    }
    let result = await myUtils.postData("userInfo", { userId: _userId });
    if (!result) {
      session.setAlert({
        text: "Something went wrong while checking user id 001",
        variant: "warning",
      });
      return;
    }
    if (!result.success) {
      session.setAlert({
        text: "Something went wrong while checking user id 002",
        variant: "warning",
      });
      return;
    }

    if (!result.userInfo) {
      console.log("checkUserIdUniqueness userId is unique");
      setUserIdNotUniqueness(false);

      return true; //it means that the userId does not exist
    } else {
      setUserIdNotUniqueness(true);
    }
    console.log("checkUserIdUniqueness", result);
  };

  useEffect(() => {
    fName && lName && bio && tel && email && profilePhoto && userId
      ? setSubmitButtonDisabeld(false)
      : setSubmitButtonDisabeld(true);
  }, [fName, lName, bio, tel, email, profilePhoto, userId]);

  function checkIsEnglish(element) {
    let char = new RegExp("[\u0600-\u06FF]");
    if (char.test(element) === true) {
      alert("Only use English characters");

      return false;
    } else {
      return true;
    }
  }

  const handleEmailCheck = () => {};

  let proposeUserId = () => {
    if (fName && lName) setUserId("@" + fName + "." + lName);
  };
  return (
    <div>
      <Container component="main" maxWidth="xs">
        <CssBaseline />

        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Signup
          </Typography>
          <form
            id="singupForm"
            ref={formRef}
            className={classes.form}
          >
            <Grid container spacing={2}>
              <Grid container justifyContent="center">
                <Grid item>
                  <Box mb={2}>
                    <Typography variant="body2">
                      Please write your information in English
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="fName"
                  variant="outlined"
                  required
                  fullWidth
                  label="Name"
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  placeholder={session.profile ? session.profile.fName : ""}
                  autoFocus
                  dir="ltr"
                  value={fName}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setFName(e.target.value.replace(/[^a-zA-Z]/gi, ""));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  label="Last name"
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  name="lName"
                  placeholder={session.profile ? session.profile.lName : ""}
                  autoComplete="lname"
                  dir="ltr"
                  value={lName}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setLName(e.target.value.replace(/[^a-zA-Z]/gi, ""));
                  }}
                  onBlur={proposeUserId}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  error={userIdNotUniqueness}
                  label="Id"
                  InputLabelProps={
                    session.profile || userId ? { shrink: true } : {}
                  }
                  name="userId"
                  placeholder={session.profile ? session.profile.userId : ""}
                  autoComplete="userId"
                  dir="ltr"
                  value={userId}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setUserId(e.target.value.replace(/[^a-zA-Z0-9]/gi, ""));
                  }}
                  onBlur={(e) => checkUserIdUniqueness(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  multiline
                  maxRows={5}
                  fullWidth
                  label="Bio"
                  name="bio"
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  placeholder={session.profile ? session.profile.bio : ""}
                  autoComplete="bio"
                  dir="ltr"
                  value={bio}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setBio(e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <ValidationTextField
                  variant="outlined"
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  placeholder={session.profile ? session.profile.email : ""}
                  autoComplete="email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setEmail(e.target.value);
                  }}
                  onBlur={handleEmailCheck}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="tel"
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  placeholder={
                    session.profile ? session.profile.tel : "0----------"
                  }
                  label="Cell"
                  type="tel"
                  autoComplete="tel"
                  dir="ltr"
                  value={tel}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setTel(e.target.value.replace(/[^0-9]/gi, ""));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="twitterId"
                  name="twitterId"
                  variant="outlined"
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  placeholder={
                    session.profile ? session.profile.twitterId : "@"
                  }
                  fullWidth
                  label="Twitter"
                  dir="ltr"
                  value={twitterId}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setTwitterId(
                      e.target.value.replace(/[^A-Za-z0-9._@]/gi, "")
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  InputLabelProps={session.profile ? { shrink: true } : {}}
                  label="Instagram"
                  name="instagramId"
                  placeholder={
                    session.profile ? session.profile.instagramId : "@"
                  }
                  autoComplete="instagramId"
                  dir="ltr"
                  value={instagramId}
                  onChange={(e) => {
                    checkIsEnglish(e.target.value);

                    setInstagramId(
                      e.target.value.replace(/[^A-Za-z0-9._@]/gi, "")
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box m={1} pt={1}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        color={session.profilePhoto ? "" : "primary"}
                        onClick={() => setOpen(true)}
                      >
                        Upload your Photo *
                      </Button>

                      <DropzoneDialog
                        filesLimit={1}
                        clearOnUnmount={false}
                        acceptedFiles={["image/*"]}
                        cancelButtonText={"Cancel"}
                        submitButtonText={"Submit"}
                        maxFileSize={5000000}
                        dropzoneParagraphClass={classes.DropzoneText}
                        open={open}
                        dropzoneText={
                          "Drag your photo here"
                        }
                        onClose={() => setOpen(false)}
                        onSave={(files) => {
                          console.log("Files:", files);
                          setProfilePhoto(files[0]);

                          setOpen(false);
                        }}
                        showPreviews={false}
                        showFileNamesInPreview={true}
                        showPreviewsInDropzone={true}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      {profilePhoto ? (
                        <Avatar
                          alt="profile photo"
                          src={URL.createObjectURL(profilePhoto)} //{URL.createObjectURL(selectedFile)}
                        />
                      ) : (
                        ""
                      )}
                    </Grid>
                  </Grid>
                </Box>
                {/* </Container> */}
              </Grid>

              <Grid item xs={12} sx={{paddingBottom:'20px'}}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      color="primary"
                      //  name="receiveNews"
                      checked={receiveNews}
                      onChange={async (e) =>
                        await setReceiveNews(e.target.checked)
                      }
                    />
                  }
                  label="I would like to receive ABC pro news"
                />
              </Grid>
            </Grid>

            {session.profile ? (
              <Button
                fullWidth
                variant="contained"
                disabled
                color="primary"
                className={classes.submit}
              >
                Already registered
              </Button>
            ) : (
              <Button
                onClick={handleSubmitForm}
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={submitButtonDisabled}
              >
                Register
              </Button>
            )}

            {session.address ? (
              ""
            ) : (
              <Grid container justifyContent="flex-start">
                <Grid item>
                  <Typography variant="body1" color="error">
                    To confirm signup, wallet should be connected!
                  </Typography>
                </Grid>
              </Grid>
            )}
          </form>
        </div>
      </Container>
    </div>
  );
}
