import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { safeTransferFromAbi } from "./safe-transfer-from-abi"

export type SafeTransferFrom = FunctionCall & {
  data: {
    from: string
    to: string
    id: string
    amount: string
    data: string
  }
}

class SafeTransferFromMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return safeTransferFromAbi
  }

  getMethod(): string {
    return "0xf242432a"
  }

  async map({ inputs }: DecodedFunctionCall): Promise<SafeTransferFrom> {
    const [from, to, id, amount, data] = inputs
    return Promise.resolve({
      interface: "SafeTransferFrom",
      method: "safeTransferFrom",
      data: {
        from,
        to,
        id: id.toString(),
        amount: amount.toString(),
        data,
      },
    })
  }
}

export const safeTransferFromMethodDecoder = new SafeTransferFromMethodDecoder()
