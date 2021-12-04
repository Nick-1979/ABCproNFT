// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;
pragma abicoder v2; // solhint-disable-line

import "./mixins/ABCproTreasuryNode.sol";
import "./mixins/roles/ABCproAdminRole.sol";
import "./mixins/NFTMarketCore.sol";
import "./mixins/SendValueWithFallbackWithdraw.sol";
import "./mixins/NFTMarketCreators.sol";
import "./mixins/NFTMarketFees.sol";
import "./mixins/NFTMarketAuction.sol";
import "./mixins/NFTMarketReserveAuction.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title A market for NFTs on ABCpro.
 * @dev This top level file holds no data directly to ease future upgrades.
 */
contract ABCNFTMarket is
  ABCproTreasuryNode,
  ABCproAdminRole,
  NFTMarketCore,
  ReentrancyGuardUpgradeable,
  NFTMarketCreators,
  SendValueWithFallbackWithdraw,
  NFTMarketFees,
  NFTMarketAuction,
  NFTMarketReserveAuction
{
  /**
   * @notice Called once to configure the contract after the initial deployment.
   * @dev This farms the initialize call out to inherited contracts as needed.
   */
  function initialize(address payable treasury) public initializer {
    ABCproTreasuryNode._initializeABCproTreasuryNode(treasury);
    NFTMarketAuction._initializeNFTMarketAuction();
    NFTMarketReserveAuction._initializeNFTMarketReserveAuction();
  }

  /**
   * @notice Allows ABCpro to update the market configuration.
   */
  function adminUpdateConfig(
    uint256 minPercentIncrementInBasisPoints,
    uint256 duration,
    uint256 primaryABCFeeBasisPoints,
    uint256 secondaryABCFeeBasisPoints,
    uint256 secondaryCreatorFeeBasisPoints
  ) public onlyABCproAdmin {
    _updateReserveAuctionConfig(minPercentIncrementInBasisPoints, duration);
    _updateMarketFees(primaryABCFeeBasisPoints, secondaryABCFeeBasisPoints, secondaryCreatorFeeBasisPoints);
  }

  /**
   * @dev Checks who the seller for an NFT is, this will check escrow or return the current owner if not in escrow.
   * This is a no-op function required to avoid compile errors.
   */
  function _getSellerFor(address nftContract, uint256 tokenId)
    internal
    view
    virtual
    override(NFTMarketCore, NFTMarketReserveAuction)
    returns (address payable)
  {
    return super._getSellerFor(nftContract, tokenId);
  }
}