const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

const ADMIN_ADDRESS = "0xa4C2E4863AFD3F1c8614A84d94f30253aca5adD2";
const TOKEN_NAME = "ABCpro NFT";
const TOKEN_SYMBOL = "ABCNFT";
const BASE_URL = "https://cloudflare-ipfs.com/ipfs/";
async function deploy_treasurry() {
  console.log("deploying ABCTreasurry ... ");

  const ABC = await ethers.getContractFactory("ABCTreasury");
  const abc = await upgrades.deployProxy(ABC, [ADMIN_ADDRESS]); //initialize here
  await abc.deployed();

  console.log("ABCTreasury deployed to:", abc.address);
  return abc.address;
}

async function deploy_NFTMARKET(_TREASURRY_ADDRESS) {
  console.log("deploying ABCNFTMarket ... ");

  const ABC = await ethers.getContractFactory("ABCNFTMarket");
  const abc = await upgrades.deployProxy(ABC, [_TREASURRY_ADDRESS]);
  await abc.deployed();
  console.log("ABCNFTMarket deployed to:", abc.address);

  await NFTMarketadminUpdateConfig(abc.address, 
    process.env.MIN_PERCENT_INCREMENT_IN_BASISPOINTS,
    process.env.AUCTION_DURATION*60*60,
    process.env.PRIMARY_ABC_FEE_BASIS_POINTS,
    process.env.SECONDARY_ABC_FEE_BASIS_POINTS,
    process.env.SECONDARY_CREATOR_FEE_BASIS_POINTS
  )
  return abc.address;
}

async function deploy_NFT721(_TreasuryAddress, _NFTMarketAddress, _BaseUrl) {
  console.log("deploying ABCNFT721 ... ");

  const ABC = await ethers.getContractFactory("ABCNFT721");
  const abc = await upgrades.deployProxy(ABC, [
    _TreasuryAddress,
    TOKEN_NAME,
    TOKEN_SYMBOL,
  ]);  
  await abc.deployed();

  console.log("ABCNFT721 deployed to:", abc.address);
  console.log("going to set (baseURL and NFTMARKET address)");
  await NFT721AdminUpdateConfig(abc.address, _NFTMarketAddress, _BaseUrl);
  return abc.address;

}

async function NFTMarketadminUpdateConfig(
  _NFTMarketAddress,
  _minPercentIncrementInBasisPoints,
  _duration,
  _primaryABCFeeBasisPoints,
  _secondaryABCFeeBasisPoints,
  _secondaryCreatorFeeBasisPoints
) {
  console.log("calling NFTMarketadminUpdateConfig ... ");
  const ABCNFTMarket_Contract = await ethers.getContractFactory("ABCNFTMarket");
  const ABCNFTMarket = await ABCNFTMarket_Contract.attach(_NFTMarketAddress);
  console.log("adminUpdateConfig params:",
    _minPercentIncrementInBasisPoints,
    _duration,
    _primaryABCFeeBasisPoints,
    _secondaryABCFeeBasisPoints,
    _secondaryCreatorFeeBasisPoints
  );
    
    
  await ABCNFTMarket.adminUpdateConfig(
    _minPercentIncrementInBasisPoints,
    _duration,
    _primaryABCFeeBasisPoints,
    _secondaryABCFeeBasisPoints,
    _secondaryCreatorFeeBasisPoints
  );
  console.log("NFTMarketadminUpdateConfig done! ");

}

async function NFT721AdminUpdateConfig(
  _NFT721Address,
  _NFTMarketAddress,
  _BaseUrl
) {
  console.log("calling NFT721AdminUpdateConfig ... ");

  const ABCNFT721_Contract = await ethers.getContractFactory("ABCNFT721");
  const ABCNFT721 = await ABCNFT721_Contract.attach(_NFT721Address);
  await ABCNFT721.adminUpdateConfig(_NFTMarketAddress, _BaseUrl);
  console.log("NFT721AdminUpdateConfig done! ");

}
async function main() {
  let contractsAddresses=[];
  console.log("starting deploying process ... ");
  //TODO: initialize treasyry with admin address
  const treasuryAddress = await deploy_treasurry();
  contractsAddresses.push(treasuryAddress);
  const NFTMarketAddress = await deploy_NFTMARKET(treasuryAddress);
  contractsAddresses.push(NFTMarketAddress);

  let NFT721Address=await deploy_NFT721(treasuryAddress, NFTMarketAddress, BASE_URL);
  contractsAddresses.push(NFT721Address);

  console.log("writting deployed addreses to contractsAddresses.txt:",contractsAddresses);

  //fs.writeFileSync("./contractsAddresses.txt",contractsAddresses)
  console.log("deploying process finished. ");
}

main()
