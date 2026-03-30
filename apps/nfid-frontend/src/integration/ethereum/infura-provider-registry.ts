import { InfuraProvider } from "ethers"

import { INFURA_API_KEY } from "@nfid/integration/token/constants"

const registry = new Map<number, InfuraProvider>()

export function getInfuraProvider(chainId: number | bigint): InfuraProvider {
  const key = Number(chainId)
  if (!registry.has(key)) {
    registry.set(key, new InfuraProvider(key, INFURA_API_KEY))
  }
  return registry.get(key)!
}
