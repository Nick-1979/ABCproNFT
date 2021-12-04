import axios from "axios";
import Globals from "./globals";
const ethUtil = require("ethereumjs-util");
const myUtils = require("./general");

require("dotenv").config();

/**
 * @dev just upload the artFile and its json file, no interaction with smartcontract
 */
const prepareNFT = async (
  file,
  name,
  description,
  _extraAttributes,
  _reservePrice = 0,
  _royality = 0,
  _nftMarketAfterFirstSale = "abcpro",
  mint = false
) => {
  console.trace('Trace of "prepareNFT"');
  try {
    if (file === null || name.trim() === "" || description.trim() === "") {
      return {
        success: false,
        status: "❗To be sure all sections are filled",
      };
    }

    const textToSign = "I would like to place my art in ABC pro gallery";
    const signature = await myUtils.signByMetamask(textToSign);
    if (!signature)
      return {
        success: false,
      };

    let data = new FormData();
    data.append("file", file);
    data.append("signature", signature);
    data.append("from", window.ethereum.selectedAddress);
    data.append("textToSign", textToSign);

    var uploadFileResponse = await axios.post(
      Globals.LOCAL_HOST_URL + "/posts/pinFile",
      data
    );
    console.log("uploadFileResponse:", uploadFileResponse);
    if (uploadFileResponse.status === 200) {
      uploadFileResponse = uploadFileResponse.data;
      if (!uploadFileResponse.success) {
        return {
          success: false,
          status: uploadFileResponse.message,
        };
      }
    } else {
      return {
        success: false,
        status: "😢 Something went wrong while connecting server to upload...",
      };
    }

    let imgUrl = "ipfs://" + uploadFileResponse.fileCid;
    console.log(`File uploaded to:${imgUrl}`);

    const metadata = {};
    let jsonData = {};
    metadata.jsonData = jsonData;
    metadata.reservePrice = _reservePrice;
    metadata.royality = _royality;
    metadata.nftMarketAfterFirstSale = _nftMarketAfterFirstSale;

    jsonData.name = name;
    jsonData.image = imgUrl;
    jsonData.description = description;
    jsonData.attributes = [
      {
        display_type: "date",
        trait_type: "birthday",
        value: Date.now(),
      },
      {
        trait_type: "File Type",
        value: uploadFileResponse.fileMimetype,
      },
      ..._extraAttributes,
    ];

    var uploadJSONResponse = await fetch(
      Globals.LOCAL_HOST_URL + "/posts/pinJSON",
      {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );

    if (uploadJSONResponse.status != 200) {
      return {
        success: false,
        status:
          "😢 Something went wrong while connecting server to upoad JSON ...",
      };
    }

    uploadJSONResponse = await uploadJSONResponse.json();
    console.log("uploadJSONResponse:: ", uploadJSONResponse);

    if (!uploadJSONResponse.success) {
      return {
        success: false,
        status: uploadJSONResponse.message,
      };
    }

    return {
      success: true,
      status: " Submitted successfully ",

      filecoinJSONUrl: uploadJSONResponse.filecoinJSONUrl,
      jsonCid: uploadJSONResponse.jsonCid,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};

export default prepareNFT;
