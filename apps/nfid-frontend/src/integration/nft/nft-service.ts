import {NFT} from "src/integration/nft/nft";
import {nftGeekService} from "src/integration/nft/geek/nft-geek-service";
import {Principal} from "@dfinity/principal";
import {nftMapper} from "src/integration/nft/impl/nft-mapper";

export class NftService {
  async getNFTs(userPrincipal: Principal): Promise<NFT[]> {
    return nftGeekService.getNftGeekData(userPrincipal)
      .then(data => data.map(nftMapper.toNFT));
  }
}

export const nftService = new NftService();
