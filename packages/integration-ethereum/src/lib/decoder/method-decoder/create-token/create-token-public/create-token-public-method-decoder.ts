import { CreateTokenMethodDecoder } from "../create-token-method-decoder"
import { createTokenPublicAbi } from "./create-token-public-abi"

class CreateTokenPublicMethodDecoder extends CreateTokenMethodDecoder {
  override getAbi(): object {
    return createTokenPublicAbi
  }

  override getMethod(): string {
    return "0x27050d1f"
  }
}

export const createTokenPublicMethodDecoder =
  new CreateTokenPublicMethodDecoder()
