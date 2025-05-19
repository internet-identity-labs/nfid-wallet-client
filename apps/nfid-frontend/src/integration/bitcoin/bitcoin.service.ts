import { SignIdentity } from "@dfinity/agent"

import { chainFusionSignerService } from "./services/chain-fusion-signer.service"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

export class BitcoinService {
  public async getAddress(identity: SignIdentity): Promise<String> {
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    const cachedValue = await authStorage.get(key)

    if (cachedValue != null) {
      return cachedValue as string
    }

    const address: string = await chainFusionSignerService.getAddress(identity)
    authStorage.set(key, address)
    return address
  }
}

export const bitcoinService = new BitcoinService()
