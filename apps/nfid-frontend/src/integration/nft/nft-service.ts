import { Principal } from "@dfinity/principal"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { NFT } from "src/integration/nft/nft"

export class NftService {
  async getNFTs(userPrincipal: Principal): Promise<NFT[]> {
    return nftGeekService
      .getNftGeekData(userPrincipal)
      .then((data) =>
        data.map(nftMapper.toNFT).filter((nft): nft is NFT => nft !== null),
      )
  }
}

export const nftService = new NftService()
