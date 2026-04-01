import { network } from "hardhat";

const CONTRACT = "0x67C0234E58F8F200fc79E0Db81714844E1b8360f";

async function main() {
  const { ethers } = await network.connect();

  const nft = await ethers.getContractAt("MyNFT", CONTRACT);

  const tx = await nft.mint({
    value: ethers.parseEther("0.001"),
  });

  await tx.wait();

  console.log("Minted!");
}

main().catch(console.error);