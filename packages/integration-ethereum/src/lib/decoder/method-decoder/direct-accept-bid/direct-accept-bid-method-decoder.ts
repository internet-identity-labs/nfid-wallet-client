import { decodeTokenByAssetClass } from "../../../decode-ethereum-function-call"
import {
  DecodedFunctionCall,
  FunctionCall,
  MethodDecoder,
} from "../method-decoder"
import { directAcceptBidAbi } from "./direct-accept-bid-abi"

export type DirectAcceptBid = FunctionCall & {
  data: {
    bidMaker: string
    bidNftAmount: string
    nft: FunctionCall
    bidPaymentAmount: string
    paymentToken: string
    bidSalt: string
    bidStart: string
    bidEnd: string
    bidDataType: string
    bidData: string
    bidSignature: string
    sellOrderPaymentAmount: string
    sellOrderNftAmount: string
    sellOrderData: string
  }
}

class DirectAcceptBidMethodDecoder implements MethodDecoder {
  getAbi(): object {
    return directAcceptBidAbi
  }

  getMethod(): string {
    return "0x67d49a3b"
  }

  async map(x: DecodedFunctionCall, chainId: string): Promise<DirectAcceptBid> {
    const [
      bidMaker,
      bidNftAmount,
      nftAssetClass,
      nftData,
      bidPaymentAmount,
      paymentToken,
      bidSalt,
      bidStart,
      bidEnd,
      bidDataType,
      bidData,
      bidSignature,
      sellOrderPaymentAmount,
      sellOrderNftAmount,
      sellOrderData,
    ] = x.inputs[0]
    const nft: FunctionCall = await decodeTokenByAssetClass(
      nftAssetClass,
      nftData,
      chainId,
    )
    return Promise.resolve({
      interface: "DirectAcceptBid",
      method: "directAcceptBid",
      data: {
        bidMaker,
        bidNftAmount: bidNftAmount.toString(),
        nft,
        bidPaymentAmount: bidPaymentAmount.toString(),
        paymentToken,
        bidSalt: bidSalt.toString(),
        bidStart: bidStart.toString(),
        bidEnd: bidEnd.toString(),
        bidDataType,
        bidData,
        bidSignature,
        sellOrderPaymentAmount: sellOrderPaymentAmount.toString(),
        sellOrderNftAmount: sellOrderNftAmount.toString(),
        sellOrderData,
      },
    })
  }
}

export const directAcceptBidMethodDecoder = new DirectAcceptBidMethodDecoder()
