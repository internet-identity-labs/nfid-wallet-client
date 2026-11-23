import { MarketPlace } from "src/integration/nft/enum/enums"
import { NftExt } from "src/integration/nft/impl/ext/nft-ext"
import { NftIcrc7 } from "src/integration/nft/impl/icrc7/nft-icrc7"
import { NFT } from "src/integration/nft/nft"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

export class NftMapper {
  public toNFT(token: IcpNftToken): NFT {
    return token.marketPlace === MarketPlace.ICRC7
      ? new NftIcrc7(token)
      : new NftExt(token)
  }
}

export const nftMapper = new NftMapper()
