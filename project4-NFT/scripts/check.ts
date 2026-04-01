import { network } from "hardhat";

const CONTRACT = "0x84cf735DfB8F8Dcc9Fa275933588F8e7A2bce72B";

async function main() {
  const { ethers } = await network.connect();

  const nft = await ethers.getContractAt("MyNFT", CONTRACT);

  console.log("Name:", await nft.name());
  console.log("Symbol:", await nft.symbol());
  console.log("Total:", (await nft.tokenCounter()).toString());
}

main().catch(console.error);