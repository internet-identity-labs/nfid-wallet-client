import { Interface, Method } from "../method-decoder/method-decoder"

export type RpcMessageFunctionalCall = {
  interface: Interface
  method: Method
  data: object
  from: string
  to?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  value?: string
}

export type RpcMessageDecoder = {
  method: string
  decode: (params: any[], chainId: string) => Promise<RpcMessageFunctionalCall>
}

export const parseHex = (x: string): string =>
  (Number(parseInt(x, 16)) / 10 ** 18).toString()
