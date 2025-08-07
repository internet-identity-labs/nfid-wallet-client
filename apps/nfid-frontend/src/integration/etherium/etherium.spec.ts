import { Ed25519KeyIdentity } from "@dfinity/identity"

import { mockIdentityA } from "@nfid/integration"

import { etheriumService } from "./etherium.service"

// const principal = Principal.fromText(
//   "535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe",
// )

let idA = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
let address = "0xAd984257f35B8dD8BF4154ccCfEDDE229CD1DC89"

describe.skip("EtheriumService", () => {
  jest.setTimeout(50000)

  it.skip("should be address", async () => {
    let response = await etheriumService.getAddress(idA)
    expect(response).toBe(address)
  })

  it("should be balance ckETH", async () => {
    let balance = await etheriumService.getBalance(address)
    expect(balance).toEqual(BigInt(174999970000000000))
    console.log(balance)
  })

  it("should be ETH balance", async () => {
    //59936866100220000n
    let ethBalance = await etheriumService.getBalance(address)
    expect(ethBalance).toBe(BigInt(59936722671726420))
  })

  it("should send ckETH to eth", async () => {
    let tr = await etheriumService.convertCkETHToEth(
      address,
      BigInt(30000000000000000),
      idA,
    )
    console.log(tr)
  })

  it("should send eth to ckETH", async () => {
    let tr = await etheriumService.depositEth(idA, BigInt(9000070045000000))
    console.log(tr)
  })
})
