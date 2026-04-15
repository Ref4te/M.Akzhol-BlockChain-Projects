import { network } from "hardhat";
import { ethers as ethersLib } from "ethers";

function toBytes32(text: string): string {
  return ethersLib.encodeBytes32String(text);
}

async function main() {
  const { ethers } = await network.connect();

  const proposalNames = [
    toBytes32("FC Barcelona"),    
    toBytes32("Real Madrid"),     
    toBytes32("Villarreal CF"),   
    toBytes32("Atletico Madrid")
  ];

  const contract = await ethers.deployContract("Ballot", [proposalNames]);
  await contract.waitForDeployment();

  console.log("Ballot deployed at:", await contract.getAddress());
}

main().catch(console.error);