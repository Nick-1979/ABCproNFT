# ABCpro Easy minting NFT Market on Filecoin

Artists can place their arts as NFTs for sale in the ABC pro Gallery, without paying minting fee. Collectors on ABC pro can migrate their purchased NFTs to other markets like OpenSea.

ABC pro stands on three main components:

    Distributed storage
    Smart contracts
    A Market

Different distributed storage spaces have been tried, among them nft.storage has the best performance and shortest response time on the FILECOIN distributed infrastructure. Filecoin storage is used to store NFT files and their metadata.

Smart contracts, which are upgradeable are deployed on the ethereum testnet, Rinkeby, but can be run on any other solidity supported blockchains.

The market, is written in javascript utilizing node.js and react.js frameworks, and Mongodb is used as the backend database.

![abcpro gallery screenshot](docs/images/ABCpro.png)

# Setup

Database name, user and password should be set in the backend .env file. The env files for backend and frontend are self-explanatory and should be set with your keys (nft.storage key and alchemy key).

Install dependencies for both '/api' and '/client' folders:

   yarn

# Run

To run both backend and frontend run:
 
    yarn dev


# To compile and deploy your own smart contract:

The smart contracts are already deployed and you can use it but if you want to have your own smart contracts run:

    cd api
    npx hardhat compile
 
    npx hardhat run contracts/scripts/deploy.js --network rinkeby
 
which deploys 'ABCTreasurry', 'ABCNFTMarket' and 'ABCNFT721' contract, then add the smart contracts address to /api/.env file.

In case you want to flatten the smart contract to verify it on etherscan, following command can be used:
 
    npx hardhat flatten ABCNFT721.sol > Flat_ABCNFT721.sol

