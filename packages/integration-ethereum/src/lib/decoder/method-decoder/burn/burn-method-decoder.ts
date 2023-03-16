import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { burnAbi } from "./burn-abi"

export type Burn = FunctionCall & {
  data: {
    tokenId: string
  }
}

class BurnMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return burnAbi
  }

  getMethod(): string {
    return "0x42966c68"
  }

  async map(x: DecodedFunctionCall): Promise<Burn> {
    const [tokenId] = x.inputs
    return Promise.resolve({
      interface: "Burn",
      method: "burn",
      data: {
        tokenId: tokenId.toString(),
      },
    })
  }
}

export const burnMethodDecoder = new BurnMethodDecoder()
