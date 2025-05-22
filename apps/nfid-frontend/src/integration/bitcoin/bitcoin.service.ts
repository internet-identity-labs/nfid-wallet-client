import { SignIdentity } from "@dfinity/agent"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { chainFusionSignerService } from "./services/chain-fusion-signer.service"
import { patronService } from "./services/patron.service"

export class BitcoinService {
  public async getAddress(identity: SignIdentity): Promise<String> {
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    const cachedValue = await authStorage.get(key)

    if (cachedValue != null) {
      return cachedValue as string
    }

    await patronService.askToPayFor(identity)
    const address: string = await chainFusionSignerService.getAddress(identity)
    await authStorage.set(key, address)
    return address
  }

  public async getBalance(
    identity: SignIdentity,
    minConfirmations?: number,
  ): Promise<bigint> {
    await patronService.askToPayFor(identity)
    return chainFusionSignerService.getBalance(identity, minConfirmations)
  }
}

export const bitcoinService = new BitcoinService()
