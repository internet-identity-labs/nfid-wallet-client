import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { mintAndTransferAbi } from "./mint-and-transfer-abi"

export type Creator = {
  creator: string
  value: string
}

export type MintAndTransfer = FunctionCall & {
  data: {
    tokenId: string
    tokenURI: string
    creators: Creator[]
    royalties: string
    signatures: string[]
    to: string
  }
}

class MintAndTransferMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return mintAndTransferAbi
  }

  getMethod(): string {
    return "0x22a775b6"
  }

  async map({ inputs }: DecodedFunctionCall): Promise<MintAndTransfer> {
    const [[tokenId, tokenURI, creators, royalties, signatures], to] = inputs

    const mappedCreators = creators.map((creator: any) => ({
      creator: creator[0],
      value: creator[1].toString(),
    }))

    return Promise.resolve({
      interface: "MintRequest",
      method: "mintAndTransfer",
      data: {
        tokenId: tokenId.toString(),
        tokenURI,
        creators: mappedCreators,
        royalties,
        signatures,
        to,
      },
    })
  }
}

export const mintAndTransferMethodDecoder = new MintAndTransferMethodDecoder()
