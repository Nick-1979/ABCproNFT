/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("dotenv").config();
 require("@nomiclabs/hardhat-ethers");
 require('hardhat-abi-exporter');


 const path = require('path');
 let dirPath = path.join(__dirname, "../api/contracts")
 console.log("hardhat dirPath:",dirPath)

 
 const defaultNetwork = "localhost";
 
 module.exports = {
   solidity: {
     version: "0.8.0",
     settings: {
       optimizer: {
         enabled: true,
         runs: 1,
       },
     },
   },
   defaultNetwork,
   paths: {
     root: path.join(__dirname, "../api/contracts"),
     sources: dirPath+"/solidities",
     tests: dirPath+"/tests",
     cache: dirPath+"/hardhat/cache",
     artifacts: dirPath+"/hardhat/artifacts",
   },
   abiExporter: {
    path: './data/abi',
    clear: false, // if true will clear in every compilation
    flat: true,
    only: [],
    spacing: 2
  },
   networks: {
     localhost: {
       url: "http://localhost:8545",
     },
     hardhat: {
       chainId:1000,
       from:'0xa4C2E4863AFD3F1c8614A84d94f30253aca5adD2',
       gas:'auto',
       gasPrice:'auto',
       gasMultiplier:1,
       accounts: [{
         privateKey:'40fd4824d9efa72b1c607b6cad8091d2a2ee7bd97e199ded63ecba76b1ae2f17',
         balance:'10000000000000000000000'}],
       hardfork:"berlin",
       // allowUnlimitedContractSize:true,
 
     },
      },
   namedAccounts: {
     deployer: {
       default: 0, // here this will by default take the first account as deployer
     },
   },
 };
 
 task("accounts", "Prints the list of accounts", async (_, { ethers }) => {
   const accounts = await ethers.provider.listAccounts();
   accounts.forEach((account) => console.log(account));
 });
 
 task("getBlockWithTransactions", "Prints the block number", async (_, { ethers }) => {
   const block = await ethers.provider.getBlockWithTransactions(1);
   console.log(block.transactions);
 });task("blockNumber", "Prints the block number", async (_, { ethers }) => {
   const blockNumber = await ethers.provider.getBlockNumber();
   console.log(blockNumber);
 });