export interface Decoder<A, M, I, O> {
  getAbi(): A
  getMethod(): M
  map(decodedFunctionCall: I, chainId: string): O
}
