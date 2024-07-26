import { MarketPlace } from "src/integration/nft/enum/enums"
import { MappedToken } from "src/integration/nft/geek/geek-types"
import { NFTExt } from "src/integration/nft/impl/ext/nft-ext"
import { NftYumi } from "src/integration/nft/impl/yumi/nft-yumi"
import { NFT } from "src/integration/nft/nft"

export class NftMapper {
  public toNFT(mappedToken: MappedToken): NFT | null {
    switch (mappedToken.marketPlace) {
      case MarketPlace.EXT:
        return new NFTExt(mappedToken)
      case MarketPlace.YUMI:
        return new NftYumi(mappedToken)
      default: {
        console.warn("Unsupported marketplace: " + mappedToken.marketPlace)
        return null
      }
    }
  }
}

export const nftMapper = new NftMapper()
