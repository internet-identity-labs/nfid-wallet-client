import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"

export type CreateToken = FunctionCall & {
  data: {
    name: string
    symbol: string
    baseURI: string
    contractURI: string
    isPrivate: boolean
  }
}

export abstract class CreateTokenMethodDecoder implements MethodDecoder {
  getAbi(): object {
    throw new Error("Method not implemented.")
  }

  getMethod(): string {
    throw new Error("Method not implemented.")
  }

  async map({ inputs }: DecodedFunctionCall): Promise<CreateToken> {
    const [name, symbol, baseURI, contractURI, isPrivate] = inputs

    return Promise.resolve({
      interface: "CollectionRequest",
      method: "createToken",
      data: {
        name,
        symbol,
        baseURI,
        contractURI,
        isPrivate: !Array.isArray(isPrivate),
      },
    })
  }
}
