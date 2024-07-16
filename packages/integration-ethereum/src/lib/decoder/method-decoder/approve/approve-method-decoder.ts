import { BigNumber } from "ethers"

import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { approveAbi } from "./approve-abi"

export type Approve = FunctionCall & {
  data: {
    spender: string
    amount: string
  }
}

class ApproveMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return approveAbi
  }

  getMethod(): string {
    return "0x095ea7b3"
  }

  async map(x: DecodedFunctionCall): Promise<Approve> {
    const [spender, amount] = x.inputs
    return Promise.resolve({
      interface: "Approve",
      method: "approve",
      data: {
        spender,
        amount: BigNumber.from(amount).toString(),
      },
    })
  }
}

export const approveMethodDecoder = new ApproveMethodDecoder()
