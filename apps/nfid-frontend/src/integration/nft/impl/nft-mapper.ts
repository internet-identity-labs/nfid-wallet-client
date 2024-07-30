import { MarketPlace } from "src/integration/nft/enum/enums"
import { MappedToken } from "src/integration/nft/geek/geek-types"
import { NftExt } from "src/integration/nft/impl/ext/nft-ext"
import { NftMemeCake } from "src/integration/nft/impl/memecake/nft-memecake"
import { NftYumi } from "src/integration/nft/impl/yumi/nft-yumi"
import { NFT } from "src/integration/nft/nft"
import {NftIcpSwap} from "src/integration/nft/impl/icpswap/nft-icpswap";

export class NftMapper {
  public toNFT(mappedToken: MappedToken): NFT | null {
    switch (mappedToken.marketPlace) {
      case MarketPlace.EXT:
        return new NftExt(mappedToken)
      case MarketPlace.YUMI:
        return new NftYumi(mappedToken)
      case MarketPlace.MEMECAKE:
        return new NftMemeCake(mappedToken)
      case MarketPlace.ICPSWAP:
        return new NftIcpSwap(mappedToken)
      default: {
        console.warn("Unsupported marketplace: " + mappedToken.marketPlace)
        return null
      }
    }
  }
}

export const nftMapper = new NftMapper()
