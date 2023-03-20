import { Interface, Method } from "../method-decoder/method-decoder"

export type ErcMessageFunctionalCall = {
  interface: Interface
  method: Method
  data: object
  from: string
  to?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  value?: string
}

export type ErcMessageDecoder = {
  method: string
  decode: (params: any[]) => Promise<ErcMessageFunctionalCall>
}

export const parseHex = (x: string): string =>
  (Number(parseInt(x, 16)) / 10 ** 18).toString()
