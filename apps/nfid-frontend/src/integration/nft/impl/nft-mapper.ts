import { MarketPlace } from "src/integration/nft/enum/enums"
import { MappedToken } from "src/integration/nft/geek/geek-types"
import { NFTExt } from "src/integration/nft/impl/ext/nft-ext"
import { NFT } from "src/integration/nft/nft"

export class NftMapper {
  public toNFT(mappedToken: MappedToken): NFT | null {
    switch (mappedToken.marketPlace) {
      case MarketPlace.EXT:
        return new ExtNftCreator().geekDataToNFT(mappedToken)
      default: {
        console.warn("Unsupported marketplace: " + mappedToken.marketPlace)
        return null
      }
    }
  }
}

export const nftMapper = new NftMapper()

interface NftCreator {
  geekDataToNFT(mappedToken: MappedToken): NFT
}

class ExtNftCreator implements NftCreator {
  geekDataToNFT(mappedToken: MappedToken): NFT {
    return new NFTExt(mappedToken)
  }
}
