const Globals = {
  IPFS_GATEWAY:
    // "https://ipfs.yt/ipfs/",
    // "https://cloudflare-ipfs.com/ipfs/",
    '.ipfs.dweb.link',
  // "https://ipfs.eth.aragon.network/ipfs/",
  LOCAL_HOST_URL: "http://localhost:8080",
  NFT_STATUS: {
    ONAUCTION: 0,
    SOLD: 1,
    SETTLED: 2,
    CANCELED: 3,
    NOTLISTED: 4,
    LISTED: 5,
  },
  AUCTION_STATUS: { ONAUCTION: 0, SOLD: 1, SETTLED: 2, CANCELED: 3 },
  NFT_MARKETS: {
    ABCPRO: 0,
    OPENSEA: 1,
  },
};
export default Globals;
