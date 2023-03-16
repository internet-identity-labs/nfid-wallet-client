import { decodeTokenByAssetClass } from "../../../decode-ethereum-function-call"
import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { directPurchaseAbi } from "./direct-purchase-abi"

export type DirectPurchase = FunctionCall & FunctionCall

class DirectPurchaseMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return directPurchaseAbi
  }

  getMethod(): string {
    return "0x0d5f7d35"
  }

  async map({ inputs }: DecodedFunctionCall): Promise<DirectPurchase> {
    const [[, , type, content]] = inputs
    return await decodeTokenByAssetClass(type, content, "directPurchase")
  }
}

export const directPurchaseMethodDecoder = new DirectPurchaseMethodDecoder()
