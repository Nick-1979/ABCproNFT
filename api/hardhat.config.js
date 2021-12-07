/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-abi-exporter");

// require("hardhat-deploy");

const { ALCHEMY_URL, ACCOUNT_PRIVATE_KEY } = process.env;

const defaultNetwork = "rinkeby";

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
    root: "./contracts",
    sources: "./solidities",
    tests: "./tests",
    cache: "./hardhat/cache",
    artifacts: "./hardhat/artifacts",
  },
  abiExporter: {
    path: "./abi",
    clear: true, // if true will clear in every compilation
    flat: true,
    only: [],
    spacing: 2,
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    hardhat: {
      chainId: 1000,
      from: "0xa4C2E4863AFD3F1c8614A84d94f30253aca5adD2",
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      accounts: [
        {
          privateKey: "Your account Private key",
          balance: "10000000000000000000000",
        },
        {
          privateKey: "Your account Private key",
          balance: "10000000000000000000000",
        },
      ],
      hardfork: "berlin",
      // allowUnlimitedContractSize:true,
    },
    rinkeby: {
      url: ALCHEMY_URL,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
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

task(
  "getBlockWithTransactions",
  "Prints the block number",
  async (_, { ethers }) => {
    const block = await ethers.provider.getBlockWithTransactions(1);
    console.log(block.transactions);
  }
);
task("blockNumber", "Prints the block number", async (_, { ethers }) => {
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(blockNumber);
});
