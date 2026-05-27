import { BitcoinCanister } from "@icp-sdk/canisters/ckbtc"
import { Principal } from "@icp-sdk/core/principal"

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
