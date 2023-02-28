import { btcWallet as btcAPI } from "../actors"

export class BtcWallet {
  async getBitcoinAddress(): Promise<string> {
    return await btcAPI.get_p2pkh_address().catch((e) => {
      throw new Error(`getBitcoinAddress: ${e.message}`)
    })
  }

  async sendSatoshi(targetAddress: string, satoshi: bigint): Promise<string> {
    return await btcAPI
      .send({
        destination_address: targetAddress,
        amount_in_satoshi: satoshi,
      })
      .catch((e) => {
        throw new Error(`sendSatoshi: ${e.message}`)
      })
  }
}
