import { useEffect, useState, useLayoutEffect, useContext } from "react";
import SessionContext from "./sessionContext";
import Button from "@mui/material/Button";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import SettingsInputAntennaOutlinedIcon from "@mui/icons-material/SettingsInputAntennaOutlined";
import PortableWifiOffOutlinedIcon from "@mui/icons-material/PortableWifiOffOutlined";
import { ethers } from "ethers";
import gUtils from "../../utils/general";
/**  * RTL stuff */
import { rtlJss, rtlTheme } from "../../utils/rtl";
import { StylesProvider } from "@mui/styles";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
/**-------end of RTL stuff------- */

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
     
      en: {
        translation: {
          "Connect Wallet": "Connect Wallet",
          Connected: "Connected",
        },
      },
    },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

const WalletButton = (props) => {
  const { t } = useTranslation();
  const session = useContext(SessionContext);
  const [network, setNetwork] = useState(null);

  async function getAndSetBalance(address) {
    let balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    balance = parseInt(balance) / 10 ** 18;
    console.log("balance is set to:", balance);
    session.setBalance(balance);
  }

  async function getAndSetNetworkAndChainId() {
    console.log("getAndSetNetworkAndChainId");
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    setNetwork(gUtils.convertChainIdToName(chainId));
    session.setChainId(chainId);
  }

  async function setProviderAndSigner() {
    console.log("setProviderAndSigner");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    session.setProvider(provider);
    const signer = provider.getSigner();
    session.setSigner(signer);

    console.log("provider:", provider);
    console.log("signer:", signer);
  }
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        let oldAddress = session.address;
        const accounts = await window.ethereum.enable();
        session.setAddress(accounts[0]);
        getAndSetNetworkAndChainId();
        console.log("addres is set to::::", accounts[0]);

        /**get &set balance */
        getAndSetBalance(accounts[0]);
        setProviderAndSigner();

        return { connectedStatus: true };
      } catch (error) {
        session.setAlert({
          variant: "warning",
          text: "Conect your wallet",
        });

        return {
          connectedStatus: false,
        };
      }
    } else {
      session.setAlert({
        text: "🦊 needs to instal metamask, downloadable from  https://metamask.io/download.html  ",
        variant: "error",
      });
      return {
        connectedStatus: false,
      };
    }
  };

  const connectWalletPressed = async () => {
    try {
      await connectWallet();
    } catch (e) {
      console.log("error: ", e);
    }
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          session.setAddress(accounts[0]);

          getAndSetNetworkAndChainId();

          session.setAlert({
            text: "Wallet: " + accounts[0] + " connected",
            variant: "info",
          });

          getAndSetBalance(accounts[0]);
        }
      });
      window.ethereum.on("chainChanged", (chainId) => {
        console.log("changed chaind:", chainId);

        getAndSetNetworkAndChainId();

        session.setAlert({
          text: "Blockchain changed",
          variant: "info",
        });
        connectWallet();
      });
    }
  }

  useEffect(() => {
    connectWalletPressed();
  }, [props.popUpWalletSignal]);

  useEffect(() => {
    addWalletListener();
  }, []);

  useLayoutEffect(() => {
    document.body.setAttribute("dir", "rtl");
  });

  return (
    <StylesProvider jss={rtlJss}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={rtlTheme}>
          <CssBaseline />

          <Button
            variant="outlined"
            color={session.address ? "primary" : "secondary"}
            id="walletButton"
            size="small"
            onClick={connectWalletPressed}
          >
            {session.address ? (
              <div>
                <SettingsInputAntennaOutlinedIcon />
                {
                  String(session.address).substring(0, 6) +
                    "..." +
                    String(session.address).substring(38) +
                    " on " +
                    network
                }
              </div>
            ) : (
              <span>
                <PortableWifiOffOutlinedIcon /> Connect Wallet {" "}
              </span>
            )}
          </Button>
        </ThemeProvider>
      </StyledEngineProvider>
    </StylesProvider>
  );
};

export default WalletButton;
