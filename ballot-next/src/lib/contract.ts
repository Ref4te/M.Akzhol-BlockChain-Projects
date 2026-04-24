export const CONTRACT_ADDRESS = "0x5FA2BDe7c9B05F9478F4BB5B4454d31a4E0600db";

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