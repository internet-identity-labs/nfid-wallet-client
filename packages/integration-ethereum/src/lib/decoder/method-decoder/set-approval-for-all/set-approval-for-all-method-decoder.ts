import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { setApprovalForAllAbi } from "./set-approval-for-all-abi"

export type SetApprovalForAll = FunctionCall & {
  data: {
    operator: string
    approved: boolean
  }
}

class SetApprovalForAllMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return setApprovalForAllAbi
  }

  getMethod(): string {
    return "0xa22cb465"
  }

  async map(x: DecodedFunctionCall): Promise<SetApprovalForAll> {
    const [operator, approved] = x.inputs
    return Promise.resolve({
      interface: "SetApprovalForAll",
      method: "setApprovalForAll",
      data: {
        operator,
        approved,
      },
    })
  }
}

export const setApprovalForAllMethodDecoder =
  new SetApprovalForAllMethodDecoder()
