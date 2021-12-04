// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "../interfaces/IABCNFTMarket.sol";
import "./ABCproTreasuryNode.sol";
import "./HasSecondarySaleFees.sol";
import "./NFT721Creator.sol";

//-----------------
import "hardhat/console.sol";

/**
 * @notice Holds a reference to the ABCpro Market and communicates fees to 3rd party marketplaces.
 */
abstract contract NFT721Market is
    ABCproTreasuryNode,
    HasSecondarySaleFees,
    NFT721Creator
{
    using AddressUpgradeable for address;

    event NFTMarketUpdated(address indexed nftMarket);

    IABCNFTMarket private nftMarket;

    /**
     * @notice Returns the address of the ABCpro NFTMarket contract.
     */
    function getNFTMarket() public view returns (address) {
        return address(nftMarket);
    }

    function _updateNFTMarket(address _nftMarket) internal {
        require(_nftMarket.isContract(), "NFT721Market: address_not_contract");
        nftMarket = IABCNFTMarket(_nftMarket);

        emit NFTMarketUpdated(_nftMarket);
    }

    /**
     * @notice Returns an array of recipient addresses to which fees should be sent.
     * The expected fee amount is communicated with `getFeeBps`.
     */
    function getFeeRecipients(uint256 id)
        public
        view
        override
        returns (address payable[] memory)
    {
        require(_exists(id), "Metadata: nonexistent_token");

        address payable[] memory result = new address payable[](2);
        result[0] = getABCproTreasury();
        result[1] = getTokenCreatorPaymentAddress(id);
        return result;
    }

    /**
     * @notice Returns an array of fees in basis points.
     * The expected recipients is communicated with `getFeeRecipients`.
     */
    function getFeeBps(
        uint256 /* id */
    ) public view override returns (uint256[] memory) {
        (
            ,
            uint256 secondaryABCFeeBasisPoints,
            uint256 secondaryCreatorFeeBasisPoints
        ) = nftMarket.getFeeConfig();
        uint256[] memory result = new uint256[](2);
        result[0] = secondaryABCFeeBasisPoints;
        result[1] = secondaryCreatorFeeBasisPoints;
        return result;
    }

    /**
     * @notice Get fee recipients and fees in a single call.
     * The data is the same as when calling getFeeRecipients and getFeeBps separately.
     */
    function getFees(uint256 tokenId)
        public
        view
        returns (
            address payable[2] memory recipients,
            uint256[2] memory feesInBasisPoints
        )
    {
        require(_exists(tokenId), "Metadata: nonexistent_token");

        recipients[0] = getABCproTreasury();
        recipients[1] = getTokenCreatorPaymentAddress(tokenId);
        (
            ,
            uint256 secondaryABCFeeBasisPoints,
            uint256 secondaryCreatorFeeBasisPoints
        ) = nftMarket.getFeeConfig();
        feesInBasisPoints[0] = secondaryABCFeeBasisPoints;
        feesInBasisPoints[1] = secondaryCreatorFeeBasisPoints;
    }

    uint256[1000] private ______gap;
}
