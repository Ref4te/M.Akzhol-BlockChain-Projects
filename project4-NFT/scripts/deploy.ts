import { network } from "hardhat";

const BASE_URI = "ipfs://bafybeihj2stgjudqlkflkcod2yhue2xltvunwfcxd25hdmfq2c4dqefu5m/";

async function main() {
  const { ethers } = await network.connect();

  const nft = await ethers.deployContract("MyNFT", [BASE_URI]);

  await nft.waitForDeployment();

  console.log("Deployed at:", await nft.getAddress());
}

main().catch(console.error);