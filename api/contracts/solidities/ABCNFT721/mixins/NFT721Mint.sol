// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

import "./OZ/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "./NFT721Creator.sol";
import "./NFT721Market.sol";
import "./NFT721Metadata.sol";

//-----------------
import "hardhat/console.sol";

/**
 * @notice Allows creators to mint NFTs.
 */
abstract contract NFT721Mint is
    Initializable,
    ERC721Upgradeable,
    NFT721Creator,
    NFT721Market,
    NFT721Metadata
{
    using AddressUpgradeable for address;

    uint256 private nextTokenId;

    event Minted(
        address indexed creator,
        uint256 indexed tokenId,
        string indexed indexedTokenIPFSPath,
        string tokenIPFSPath
    );

    /*
   * bytes4(keccak256('mintAndApproveMarket(string memory)')) == 0xf44f948d
   
      * bytes4(keccak256('mintAndApproveMarket(string)')) == 0xfb8b74aa

   */
    bytes4 private constant _INTERFACE_MINT_AND_APPROVE_MARKET = 0xf44f948d;

    /**
     * @notice Gets the tokenId of the next NFT minted.
     */
    function getNextTokenId() public view returns (uint256) {
        return nextTokenId;
    }

    /**
     * @dev Called once after the initial deployment to set the initial tokenId.
     */
    function _initializeNFT721Mint() internal initializer {
        // Use ID 1 for the first NFT tokenId
        nextTokenId = 1;

        //added by Nick
        _registerInterface(_INTERFACE_MINT_AND_APPROVE_MARKET);
    }

    /**
     * @notice Allows the first bider (named minter) to mint an NFT for a creator on ABC
     */
    function mintForAndApproveMarketOnABC(
        string memory _tokenIPFSPath,
        address payable _creator,
        address payable _minter
    ) public returns (uint256 tokenId) {

        tokenId= mintFor(_creator,_minter, _tokenIPFSPath);

        setApprovalFirstBiderForAllonABC(_minter, getNFTMarket(), true);
    }

    /**
     * @notice Allows a bider to mint an NFT for a creator .
     */
    function mintFor(
        address payable _creator,
        address payable _minter,
        string memory _tokenIPFSPath
    ) public returns (uint256 tokenId) {
        tokenId = nextTokenId++;

        _mint(_minter, tokenId);

        _updateTokenCreator(tokenId, _creator);

        _setTokenIPFSPath(tokenId, _tokenIPFSPath);

        emit Minted(msg.sender, tokenId, _tokenIPFSPath, _tokenIPFSPath);
    }

    /**
     * @notice Allows a creator to mint an NFT.
     */
    function mint(string memory tokenIPFSPath)
        public
        returns (uint256 tokenId)
    {
        tokenId = nextTokenId++;

        _mint(msg.sender, tokenId);

        _updateTokenCreator(tokenId, payable(msg.sender));

        _setTokenIPFSPath(tokenId, tokenIPFSPath);

        emit Minted(msg.sender, tokenId, tokenIPFSPath, tokenIPFSPath);
    }

    /**
     * @notice Allows a creator to mint an NFT and set approval for the ABCpro marketplace.
     * This can be used by creators the first time they mint an NFT to save having to issue a separate
     * approval transaction before starting an auction.
     */
    function mintAndApproveMarket(string memory tokenIPFSPath)
        public
        returns (uint256 tokenId)
    {
        console.log("mintAndApproveMarket . ");

        tokenId = mint(tokenIPFSPath);
        console.log("mintAndApproveMarket minted. ");

        setApprovalForAll(getNFTMarket(), true);
    }

    /**
     * @notice Allows a creator to mint an NFT and have creator revenue/royalties sent to an alternate address.
     */
    function mintWithCreatorPaymentAddress(
        string memory tokenIPFSPath,
        address payable tokenCreatorPaymentAddress
    ) public returns (uint256 tokenId) {
        require(
            tokenCreatorPaymentAddress != address(0),
            "NFT721Mint: tokenCreatorPaymentAddress_required"
        );
        tokenId = mint(tokenIPFSPath);
        _setTokenCreatorPaymentAddress(tokenId, tokenCreatorPaymentAddress);
    }

    /**
     * @notice Allows a creator to mint an NFT and have creator revenue/royalties sent to an alternate address.
     * Also sets approval for the ABCpro marketplace.  This can be used by creators the first time they mint an NFT to
     * save having to issue a separate approval transaction before starting an auction.
     */
    function mintWithCreatorPaymentAddressAndApproveMarket(
        string memory tokenIPFSPath,
        address payable tokenCreatorPaymentAddress
    ) public returns (uint256 tokenId) {
        tokenId = mintWithCreatorPaymentAddress(
            tokenIPFSPath,
            tokenCreatorPaymentAddress
        );
        setApprovalForAll(getNFTMarket(), true);
    }

    /**
     * @notice Allows a creator to mint an NFT and have creator revenue/royalties sent to an alternate address
     * which is defined by a contract call, typically a proxy contract address representing the payment terms.
     */
    function mintWithCreatorPaymentFactory(
        string memory tokenIPFSPath,
        address paymentAddressFactory,
        bytes memory paymentAddressCallData
    ) public returns (uint256 tokenId) {
        bytes memory returnData = paymentAddressFactory.functionCall(
            paymentAddressCallData
        );
        address payable tokenCreatorPaymentAddress;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            tokenCreatorPaymentAddress := mload(add(returnData, 32))
        }
        tokenId = mintWithCreatorPaymentAddress(
            tokenIPFSPath,
            tokenCreatorPaymentAddress
        );
    }

    /**
     * @notice Allows a creator to mint an NFT and have creator revenue/royalties sent to an alternate address
     * which is defined by a contract call, typically a proxy contract address representing the payment terms.
     * Also sets approval for the ABCpro marketplace.  This can be used by creators the first time they mint an NFT to
     * save having to issue a separate approval transaction before starting an auction.
     */
    function mintWithCreatorPaymentFactoryAndApproveMarket(
        string memory tokenIPFSPath,
        address paymentAddressFactory,
        bytes memory paymentAddressCallData
    ) public returns (uint256 tokenId) {
        tokenId = mintWithCreatorPaymentFactory(
            tokenIPFSPath,
            paymentAddressFactory,
            paymentAddressCallData
        );
        setApprovalForAll(getNFTMarket(), true);
    }

    /**
     * @dev Explicit override to address compile errors.
     */
    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721Upgradeable, NFT721Creator, NFT721Metadata)
    {
        super._burn(tokenId);
    }

    uint256[1000] private ______gap;
}
