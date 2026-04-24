export const CONTRACT_ADDRESS = "0x91583c8922Cd244c7344Dc1fE46Df8024CF6e155";

export const ABI = [
"function chairperson() view returns (address)",
"function giveRightToVote(address voter)",
"function delegate(address to)",
"function vote(uint proposal)",
"function winningProposal() view returns (uint)",
"function winnerName() view returns (bytes32)",
"function proposals(uint) view returns (bytes32 name, uint voteCount)",
"function voters(address) view returns (uint weight, bool voted, address delegate, uint vote)"
] as const;