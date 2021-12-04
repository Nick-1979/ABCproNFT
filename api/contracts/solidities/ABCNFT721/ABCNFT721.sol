// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

// import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol";
import "./mixins/OZ/ERC721Upgradeable.sol";
import "./mixins/ABCproTreasuryNode.sol";
import "./mixins/roles/ABCproAdminRole.sol";
import "./mixins/HasSecondarySaleFees.sol";
import "./mixins/NFT721Core.sol";
import "./mixins/NFT721Market.sol";
import "./mixins/NFT721Creator.sol";
import "./mixins/NFT721Metadata.sol";
import "./mixins/NFT721Mint.sol";

/**
 * @title ABCpro NFTs implemented using the ERC-721 standard.
 * @dev This top level file holds no data directly to ease future upgrades.
 */
contract ABCNFT721 is
    ABCproTreasuryNode,
    ABCproAdminRole,
    // ERC165Upgradeable,
    ERC165StorageUpgradeable,
    HasSecondarySaleFees,
    ERC721Upgradeable,
    NFT721Core,
    NFT721Creator,
    NFT721Market,
    NFT721Metadata,
    NFT721Mint
{
    /**
     * @notice Called once to configure the contract after the initial deployment.
     * @dev This farms the initialize call out to inherited contracts as needed.
     */
    function initialize(
        address payable treasury,
        string memory name,
        string memory symbol
    ) public initializer {
        ABCproTreasuryNode._initializeABCproTreasuryNode(treasury);

        ERC721Upgradeable.__ERC721_init(name, symbol); //ABC NFT
        HasSecondarySaleFees._initializeHasSecondarySaleFees();
        NFT721Creator._initializeNFT721Creator();
        NFT721Mint._initializeNFT721Mint();
    }

    /**
     * @notice Allows an ABCpro admin to update NFT config variables.
     * @dev This must be called right after the initial call to `initialize`.
     */
    function adminUpdateConfig(address _nftMarket, string memory baseURI)
        public
        onlyABCproAdmin
    {
        _updateNFTMarket(_nftMarket);
        _updateBaseURI(baseURI);
    }

    /**
     * @dev This is a no-op, just an explicit override to address compile errors due to inheritance.
     */
    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721Upgradeable, NFT721Creator, NFT721Metadata, NFT721Mint)
    {
        super._burn(tokenId);
    }
}
