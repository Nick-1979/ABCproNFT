import prepareNFT from "./prepareNFT";

require("dotenv").config();

//TODO: rewrite to use metamask provider
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const OPENSEAURL = "https://testnets.opensea.io/assets/";

const contract = require("./NFTpro.json");
const contractAddress = "0xf5369b3E5CF2C634e130502F62001Db948d411E5";

const mintNFT = async (
  file,
  name,
  description,
  _extraAttributes,
  _reservePrice = 0,
  _royality = 0
) => {
  let preparation = await prepareNFT(
    file,
    name,
    description,
    _extraAttributes,
    _reservePrice,
    _royality,
    true
  );
  console.log("mint preparation was ", preparation.success);

  if (preparation.success) {
    window.contract = await new web3.eth.Contract(
      contract.abi,
      contractAddress
    );
    let userAccounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    console.log("preparation: ", preparation);
    const transactionParameters = {
      to: contractAddress,
      from: userAccounts[0], // must match user's active address.
      data: window.contract.methods
        .mintNFT(userAccounts[0], preparation.filecoinJSONUrl)
        .encodeABI(), //make call to NFT smart contract
    };

    console.log("transacto: ", transactionParameters);

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      //TODO: may have issue in concurrent case
      let LatestTokenId = await window.contract.methods.totalSupply().call();
      LatestTokenId = Number(LatestTokenId) + 1; //because it will take a little to include the transaction in block.

      console.log(LatestTokenId);

      return {
        success: true,
        status:
          "✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" +
          txHash,
        assetUrlOnOpenSea: OPENSEAURL + contractAddress + "/" + LatestTokenId,
        imgUrl: preparation.imgUrl,
      };
    } catch (error) {
      return {
        success: false,
        status: "😥 Something went wrong: " + error.message,
      };
    }
  } else {
    return {
      success: false,
      status: "😥 Something went wrong while prepare minting ... ",
    };
  }
};

export default mintNFT;
