import { Ed25519KeyIdentity } from "@dfinity/identity"

import { mockIdentityA } from "@nfid/integration"

import { getEthActivitiesRows } from "./eth-transaction.service"
import { ethereumService } from "./ethereum.service"

// const principal = Principal.fromText(
//   "535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe",
// )

let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
let address = "0xAd984257f35B8dD8BF4154ccCfEDDE229CD1DC89"

describe("EthereumService", () => {
  jest.setTimeout(50000)

  it.skip("should be address", async () => {
    let response = await ethereumService.getAddress(idA)
    expect(response).toBe(address)
  })

  it.skip("should be balance ckETH", async () => {
    let balance = await ethereumService.getBalance(address)
    expect(balance).toEqual(BigInt(174999970000000000))
    console.log(balance)
  })

  it.skip("should be ETH balance", async () => {
    //59936866100220000n
    let ethBalance = await ethereumService.getBalance(address)
    expect(ethBalance).toBe(BigInt(59936722671726420))
  })

  it.skip("should send ckETH to eth", async () => {
    let tr = await ethereumService.convertFromCkEth(address, "0.03", idA)
    console.log(tr)
  })

  it.skip("should send eth to ckETH", async () => {
    let tr = await ethereumService.convertToCkEth(idA, "0.009000070045", {
      gasUsed: BigInt(21_000),
      maxPriorityFeePerGas: BigInt(2_000_000_000),
      maxFeePerGas: BigInt(5_000_000_000),
      baseFeePerGas: BigInt(0),
    })
    console.log(tr)
  })
})
