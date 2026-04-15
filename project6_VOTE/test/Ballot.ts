import { describe, it, before } from "node:test";
import assert from "node:assert";
import { network } from "hardhat";
import { ethers as ethersLib } from "ethers";

function toBytes32(text: string): string {
  return ethersLib.encodeBytes32String(text);
}

describe("Ballot", () => {
  let contract: any;
  let chairperson: any;
  let voter1: any;
  let voter2: any;

  before(async () => {
    const { ethers } = await network.connect();
    [chairperson, voter1, voter2] = await ethers.getSigners();

    const proposalNames = [
      toBytes32("FC Barcelona"),    
      toBytes32("Real Madrid"),     
      toBytes32("Villarreal CF"),   
      toBytes32("Atletico Madrid")
    ];

    contract = await ethers.deployContract("Ballot", [proposalNames]);
    await contract.waitForDeployment();
  });

  it("chairperson should have weight 1", async () => {
    const voter = await contract.voters(chairperson.address);
    assert.equal(voter.weight.toString(), "1");
  });

  it("chairperson can give right to vote", async () => {
    await contract.giveRightToVote(voter1.address);
    const voter = await contract.voters(voter1.address);
    assert.equal(voter.weight.toString(), "1");
  });

  it("voter can vote", async () => {
    await contract.connect(voter1).vote(0);
    const voter = await contract.voters(voter1.address);
    assert.equal(voter.voted, true);
  });

  it("winner should be FC Barcelona", async () => {
    const winner = await contract.winnerName();
    const winnerName = ethersLib.decodeBytes32String(winner);
    assert.equal(winnerName, "FC Barcelona");
  });

  it("can delegate vote", async () => {
    await contract.giveRightToVote(voter2.address);
    await contract.connect(voter2).delegate(chairperson.address);

    const voter = await contract.voters(voter2.address);
    assert.equal(voter.voted, true);
  });
});