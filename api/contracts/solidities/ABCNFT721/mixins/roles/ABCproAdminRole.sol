// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;
import "../../interfaces/IAdminRole.sol";

import "../ABCproTreasuryNode.sol";

/**
 * @notice Allows a contract to leverage an admin role defined by the ABCpro contract.
 */
abstract contract ABCproAdminRole is ABCproTreasuryNode {
  // This file uses 0 data slots (other than what's included via ABCproTreasuryNode)

  modifier onlyABCproAdmin() {
    require(
      IAdminRole(getABCproTreasury()).isAdmin(msg.sender),
      "AdminRole: caller_not_Admin"
    );
    _;
  }
}