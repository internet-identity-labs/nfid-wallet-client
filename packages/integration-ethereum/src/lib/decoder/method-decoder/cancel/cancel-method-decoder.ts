import { decodeTokenByAssetClass } from "../../../decode-ethereum-function-call"
import {
  MethodDecoder,
  FunctionCall,
  DecodedFunctionCall,
} from "../method-decoder"
import { cancelAbi } from "./cancel-abi"

export type CancelOrder = FunctionCall & {
  data: {
    maker: string
    makeAsset: FunctionCall
    taker: string
    takeAssetPrice: string
    salt: string
    start: string
    end: string
  }
}

export class CancelMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return cancelAbi
  }

  getMethod(): string {
    return "0xe2864fe3"
  }

  async map(x: DecodedFunctionCall, chainId: string): Promise<CancelOrder> {
    const [[maker, makeAssets, taker, [_, takeAssetPrice], salt, start, end]] =
      x.inputs
    const [assetClass, assetId] = makeAssets[0]

    const makeAsset = await decodeTokenByAssetClass(
      assetClass,
      assetId,
      chainId,
    )

    return {
      interface: "CancelOrder",
      method: "cancel",
      data: {
        maker,
        makeAsset,
        taker,
        takeAssetPrice: takeAssetPrice.toString(),
        salt: salt.toString(),
        start: start.toString(),
        end: end.toString(),
      },
    }
  }
}

export const cancelMethodDecoder = new CancelMethodDecoder()
