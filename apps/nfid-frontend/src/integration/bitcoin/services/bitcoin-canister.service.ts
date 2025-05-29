import { BitcoinCanister } from "@dfinity/ckbtc"
import { Principal } from "@dfinity/principal"

class BitcoinCanisterService {
  public async getBalanceQuery(address: string): Promise<bigint> {
    const btcCanister = BitcoinCanister.create({
      canisterId: Principal.from(BITCOIN_CANISTER_ID),
    })
    return btcCanister.getBalanceQuery({
      address,
      network: "mainnet",
      minConfirmations: 6,
    })
  }
}

export const bitcoinCanisterService = new BitcoinCanisterService()
