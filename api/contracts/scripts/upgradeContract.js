// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const ABCV2 = await ethers.getContractFactory("ABCNFT721-V2");
  const abc = await upgrades.upgradeProxy(ABCNFT721_ADDRESS, ABCV2);
  console.log("ABC upgraded");
}

main();