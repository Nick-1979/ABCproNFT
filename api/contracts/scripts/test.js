const fs = require("fs");
const { ethers, upgrades } = require("hardhat");

const ADMIN = "0xa4C2E4863AFD3F1c8614A84d94f30253aca5adD2";
/**Contracts' addresses */
// const ABCTREASURY_ADDRESS = "0x9c5718e7d95c181A71FBdd1Fd177e1aB1E331143";
// const ABCNFTMARKET_ADDRESS = "0x9789b589b3Df6b73cE015386edfA4812dc863444";
// const ABCNFT721_ADDRESS = "0xCD0208C1253E81e7bA248862269D7826a2216F88";

// const PROVIDER = new ethers.providers.AlchemyProvider(NETWORK);

async function contractAddreseses() {
  let addresses = await fs.readFileSync("./contractsAddresses.txt", "utf8");
  return addresses.split(",");
}

// placeFirstBid("QmNzJrLcFQdqX3xMs7oiRNH6Ng7kH3UgkAVPp49v8rPqbB","0xcEEd9D23E7Ab6b6cc772126302f24d3A1d909195",3);

async function placeFirstBid(
  _tokenIPFSPath,
  _tokenCreatorAddress,
  _reservePrice
) {
  const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
    await contractAddreseses();

  const ABCNFTMARKET_Contract = await ethers.getContractFactory("ABCNFTMarket");
  const ABCNFTMARKET = await ABCNFTMARKET_Contract.attach(ABCNFTMARKET_ADDRESS);

  /**  string memory _tokenIPFSPath,
    address payable _tokenCreatorAddress ,
    uint256 _reservePrice,
    address _nftContract
    */

  let rPrice = ethers.utils.parseUnits(_reservePrice.toString(), 18);
  console.log(
    "placeFirstBidOnABC",
    await ABCNFTMARKET.MintForAndplaceFirstBidOnABC(
      _tokenIPFSPath,
      _tokenCreatorAddress,
      rPrice,
      ABCNFT721_ADDRESS,
      {
        //   // gasLimit: 250000,
        value: rPrice,
      }
    )
  );
}

async function placeBid(_auctionId, _bidAmount) {
  const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
    await contractAddreseses();

  const ABCNFTMARKET_Contract = await ethers.getContractFactory("ABCNFTMarket");
  const ABCNFTMARKET = await ABCNFTMARKET_Contract.attach(ABCNFTMARKET_ADDRESS);
  console.log(await ABCNFTMARKET.functions);

  let rPrice = ethers.utils.parseUnits(_bidAmount.toString(), 18);
  console.log(
    "placeBid",
    await ABCNFTMARKET.placeBid(_auctionId, {
      value: rPrice,
    })
  );
}

async function showFunctions() {
  const [ABCTREASURY_ADDRESS, ABCNFTMARKET_ADDRESS, ABCNFT721_ADDRESS] =
    await contractAddreseses();

  const ABCNFTMARKET_Contract = await ethers.getContractFactory("ABCNFTMarket");
  const ABCNFTMARKET = await ABCNFTMARKET_Contract.attach(ABCNFTMARKET_ADDRESS);
  console.log(await ABCNFTMARKET.functions);

  // await ABCNFTMARKET.adminUpdateConfig(
  //   1000,
  //   30*60,
  //   1500,
  //   500,
  //   1000
  // );

  console.log(await ABCNFTMARKET.getReserveAuctionConfig());
  let reserveAuction = await ABCNFTMARKET.getReserveAuction(3);
  let endTime = reserveAuction.endTime.toString();

  let now = Math.floor(new Date().getTime() / 1000);
  console.log("dif", endTime - now);
}
showFunctions();
