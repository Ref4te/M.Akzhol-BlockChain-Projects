// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public tokenCounter;
    uint256 public constant MAX_SUPPLY = 10;
    uint256 public constant PRICE = 0.001 ether;

    string public baseURI;

    constructor(string memory _baseURI) ERC721("MyNFT", "MNFT") {
        baseURI = _baseURI;
    }

    function mint() public payable {
        require(tokenCounter < MAX_SUPPLY, "All NFTs minted");
        require(msg.value >= PRICE, "Not enough ETH");

        _safeMint(msg.sender, tokenCounter);
        tokenCounter++;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function totalSupply() public view returns (uint256) {
        return tokenCounter;
    }

    function tokensOfOwner(
        address ownerAddr
    ) public view returns (uint256[] memory) {
        uint256 count = balanceOf(ownerAddr);
        uint256[] memory tokens = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < tokenCounter; i++) {
            if (ownerOf(i) == ownerAddr) {
                tokens[index] = i;
                index++;
            }
        }

        return tokens;
    }
}
