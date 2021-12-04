import { useEffect, useContext, useLayoutEffect, useState } from "react";
import SessionContext from "./sessionContext";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import {Avatar,Link,Zoom,Tooltip} from "@mui/material";
import { getUserProfile } from "../../utils/general";

/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";
import { StylesProvider, } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
/**-------end of RTL stuff------- */

const UserProfile = (props) => {
  const session = useContext(SessionContext);
  const [profilePhoto, setProfilePhoto] = useState();
  useLayoutEffect(() => {
    document.body.setAttribute("dir", "rtl");
  });

  useEffect(() => {
    async function func() {
      if (!session.address) return;
      let result = await getUserProfile(session.address);
      if (!result) {
        console.log('can not get user Info in wallet profile')
        session.setProfile(null);// reseting user profile
        setProfilePhoto(null)
        return};
      session.setProfile(result);

      let photo = new Buffer.from(result.profilePhoto.data.data).toString(
        "base64"
      );
      setProfilePhoto(photo);

      console.log("User session.profile:", result);
    }
    func();
  }, [session.address]);

  const showProfile = () => {
    let id=session.profile?session.profile.userId:session.address;

    console.log('show profile in wallet profile')
    let url =
      window.location.protocol +
      "//" +
      window.location.hostname +
      "/profile/" +
     id;
    window.open(url, "_self");
  };
  
  return (
    <StylesProvider jss={rtlJss}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={rtlTheme}>
          <Tooltip
            title="Profile"
           // transitionComponent={Zoom}
            aria-label="Profile"
          ><Link   component="button"
          >
            {profilePhoto ? (
              <Avatar
                alt="profile photo"
                src={`data:image/png;base64,${profilePhoto}`}
                onClick={showProfile}
              />
            ) : (
              <Avatar>
                <AccountCircleRoundedIcon  onClick={showProfile}/>
              </Avatar>
            )}
            </Link>
          </Tooltip>
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  );
};

export default UserProfile;
