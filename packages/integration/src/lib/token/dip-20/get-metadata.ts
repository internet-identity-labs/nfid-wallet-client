import { makeDip20Actor } from "./actor"
import { Metadata } from "./dip-20.d"

export interface TokenMetadata extends Metadata {
  canisterId: string
}

export async function getMetadata(canisterId: string): Promise<TokenMetadata> {
  const dip20 = makeDip20Actor(canisterId)
  return dip20
    .getMetadata()
    .then((metadata) => ({
      canisterId,
      ...metadata,
    }))
    .catch((e) => {
      throw new Error(`getMetadata: ${e.message}`)
    })
}
