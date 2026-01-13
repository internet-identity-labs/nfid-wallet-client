import { MarketPlace } from "src/integration/nft/enum/enums"
import { MappedToken } from "src/integration/nft/geek/geek-types"
import { NftExt } from "src/integration/nft/impl/ext/nft-ext"
import { NftIcpSwap } from "src/integration/nft/impl/icpswap/nft-icpswap"
import { NftMemeCake } from "src/integration/nft/impl/memecake/nft-memecake"
import { NftYumi } from "src/integration/nft/impl/yumi/nft-yumi"
import { NFT } from "src/integration/nft/nft"

export class NftMapper {
  public toNFT(mappedToken: MappedToken): NFT | null {
    switch (mappedToken.marketPlace) {
      case MarketPlace.EXT:
        return new NftExt(mappedToken)
      case MarketPlace.YUKU:
        return new NftYumi(mappedToken)
      case MarketPlace.MEMECAKE:
        return new NftMemeCake(mappedToken)
      case MarketPlace.ICPSWAP:
        return new NftIcpSwap(mappedToken)
      default: {
        console.warn(`Unsupported marketplace: ${mappedToken.marketPlace}`)
        return null
      }
    }
  }
}

export const nftMapper = new NftMapper()
