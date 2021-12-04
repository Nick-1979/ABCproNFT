// SPDX-License-Identifier: MIT OR Apache-2.0
// solhint-disable

pragma solidity ^0.8.0;

interface IABCNFT721 {
    function tokenCreator(uint256 tokenId)
        external
        view
        returns (address payable);

    function getTokenCreatorPaymentAddress(uint256 tokenId)
        external
        view
        returns (address payable);

    function mintAndApproveMarket(string memory tokenIPFSPath)
        external
        returns (uint256);

    function mintForAndApproveMarketOnABC(
        string memory _tokenIPFSPath,
        address payable _creator,
        address payable _minter
    ) external returns (uint256);
}
