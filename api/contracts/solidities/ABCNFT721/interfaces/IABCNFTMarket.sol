// SPDX-License-Identifier: MIT OR Apache-2.0
// solhint-disable

pragma solidity ^0.8.0;

interface IABCNFTMarket {
  function getFeeConfig()
    external
    view
    returns (
      uint256 primaryABCFeeBasisPoints,
      uint256 secondaryABCFeeBasisPoints,
      uint256 secondaryCreatorFeeBasisPoints
    );
}