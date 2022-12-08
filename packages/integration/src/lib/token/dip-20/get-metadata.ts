import { makeDip20Actor } from "./actor"

export async function getMetadata(canisterId: string) {
  const dip20 = makeDip20Actor(canisterId)
  return dip20.getMetadata().catch((e) => {
    throw new Error(`getMetadata: ${e.message}`)
  })
}
