require("dotenv").config();
const fs = require("fs");
const { NFTStorage, Blob } = require("nft.storage");

const token = process.env.FILECOIN_NFT_STORAGE_KEY;
const endpoint = process.env.FILECOIN_ENDPOINT;

module.exports = {
  async pinJSONToIPFS(_JSONBody) {
    try {
      const storage = new NFTStorage({ endpoint, token });

      const metadata = new Blob(JSON.stringify(_JSONBody), {
        type: "application/json",
      });
      const cid = await storage.storeBlob(metadata);

      return {
        success: true,
        filecoinJSONUrl: "https://" + cid + ".ipfs.dweb.link",
        jsonCid: cid,
      };
    } catch (e) {
      console.log("something went wrong while pinJSONToIPFS" + e);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  async pinFileToIPFS(_file) {
    try {
      const storage = new NFTStorage({ endpoint, token });

      const data = await fs.promises.readFile(_file.path);
      const cid = await storage.storeBlob(new Blob([data]));

      return {
        success: true,
        fileCid: cid,
        fileMimetype: _file.mimetype,
        message: "File uploaded to the IPFS successfully.",
      };
    } catch (e) {
      console.log("something went wrong while pinFileToIPFS" + e);

      return {
        success: false,
        message: "Something went wrong on abcpro while uploading to IPFS",
      };
    }
  },
};
