import { CreateTokenMethodDecoder } from "../create-token-method-decoder"
import { createTokenPrivateAbi } from "./create-token-private-abi"

class CreateTokenPrivateMethodDecoder extends CreateTokenMethodDecoder {
  override getAbi(): object {
    return createTokenPrivateAbi
  }

  override getMethod(): string {
    return "0x72397ad5"
  }
}

export const createTokenPrivateMethodDecoder =
  new CreateTokenPrivateMethodDecoder()
