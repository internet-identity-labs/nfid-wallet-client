import { btcWallet as btcAPI } from "../actors"
import { hasOwnProperty } from "../test-utils";


export async function getBitcoinAddress(): Promise<string> {
  const btcAddress = await btcAPI.get_p2pkh_address().catch((e) => {
    throw new Error(`getBitcoinAddress: ${e.message}`)
  })
  return btcAddress
}

export async function getBalance(address: string): Promise<bigint> {
  const balance = await btcAPI.get_balance(address).catch((e) => {
    throw new Error(`getBalance: ${e.message}`)
  })
  return balance
}

export async function getUTXOs(address: string): Promise<any> {
  const balance = await btcAPI.get_utxos(address).catch((e) => {
    throw new Error(`getBalance: ${e.message}`)
  })
  return balance
}
