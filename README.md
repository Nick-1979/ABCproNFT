# ABCpro Easy minting NFT Market

In ABCpro, you can put your items for sale in the market, without paying minting fee. you can list, run an auction for your NFTs. Buyers even have the option to migrate their bought NFTs to other markets like OpenSea.


I have tryied different distributed storage, but among them nft.storage on FILECOIN distributed infrastructure has the best performance and the lowest response time. Filecoin storage is used to keep NFT files and their metadata.

smartcontracts, which are upgradeable deployed on ethereum testnet Rinkeby, but can be run on any other solidity supported blockchains.

![abcpro gallery screenshot](docs/images/ABCpro.png)

# Setup

Mongodb is used as backend database. it's name, user and password should be set in backend env file. The .env files for backend and frontend are self-explanatory and should be set with your keys (nft.storage key and alchemy key).

Install dependencies for both '/api' and '/client' folders:

    npm install

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

