import {NFT} from "src/integration/nft/nft";
import {NFTExt} from "src/integration/nft/impl/nft-ext";
import {MappedToken} from "src/integration/nft/geek/geek-types";
import {MarketPlace} from "src/integration/nft/enum/enums";

export class NftMapper {
  public toNFT(mappedToken: MappedToken): NFT {
    switch (mappedToken.marketPlace) {
      case MarketPlace.EXT:
        return new ExtNftCreator().geekDataToNFT(mappedToken);
      default:
        throw new Error(`Marketplace ${mappedToken.marketPlace} not supported`)
    }
  }
}

export const nftMapper = new NftMapper();

interface NftCreator {
  geekDataToNFT(mappedToken: MappedToken): NFT;
}

class ExtNftCreator implements NftCreator {
  geekDataToNFT(mappedToken: MappedToken): NFT {
    return new NFTExt(mappedToken);
  }
}
