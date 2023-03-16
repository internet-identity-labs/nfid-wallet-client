import { functionCallDecoder } from "./decoder/function-call-decoder"
import { FunctionCall } from "./decoder/method-decoder/method-decoder"

export async function decode(data: string): Promise<FunctionCall> {
  return functionCallDecoder.decode(data)
}

export async function decodeTokenByAssetClass(
  type: string,
  data: string,
  method = "sell",
): Promise<FunctionCall> {
  return functionCallDecoder.decodeByAssetClass(type, data, method)
}
