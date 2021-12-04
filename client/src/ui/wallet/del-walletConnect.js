import Web3 from "web3";
import Web3Modal from "web3modal";

const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
  theme: "dark"
});

const provider = await web3Modal.connect();

const web3 = new Web3(provider);

// Subscribe to accounts change
provider.on("accountsChanged", (accounts) => {
    console.log(accounts);
  });
  
  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    console.log(chainId);
  });
  
  // Subscribe to provider connection
  provider.on("connect", (info  ) => {
    console.log(info);
  });
  
  // Subscribe to provider disconnection
  provider.on("disconnect", (error ) => {
    console.log(error);
  });