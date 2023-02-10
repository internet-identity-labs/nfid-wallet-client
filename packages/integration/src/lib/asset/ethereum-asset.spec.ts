import { BigNumber } from "@rarible/utils"

import { EthereumAsset, Balance } from "./ethereum-asset"

describe("Ethereum Asset", () => {
  jest.setTimeout(200000)

  it("should return one fungible tx", async function () {
    const actual = await EthereumAsset.getFungibleActivityByUser({ sort: "asc", size: 1 })
    expect(actual).toEqual([
      {
        type: 'transfer',
        date: '1674484632',
        to: '0x382901144a77bec53493fa090053b9c63da5dd07',
        from: '0xdc75e8c3ae765d8947adbc6698a2403a6141d439',
        transactionHash: '0xc69ffa77fa4a3e29050a5fbc9014f206278d958be966d2fe6d7e3864db77220a',
        price: '1000000000000000',
        gasPrice: '1500000018'
      }
    ])
  })

  it("should request balance", async function () {
    const balance: Balance = await EthereumAsset.getBalance()
    expect(balance).toMatchObject({
      balance: expect.any(BigNumber),
      balanceinUsd: expect.any(BigNumber),
    })
  })

  it("should request activities by item", async function () {
    try {
      const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
      const tokenId =
        "88260187566799326202913268841041605580353496351673437472672373155789474365442"
      await EthereumAsset.getActivitiesByItem(contract, tokenId)
    } catch (e) {
      fail(e)
    }
  })

  it("should request activities by user", async function () {
    try {
      await EthereumAsset.getActivitiesByUser()
    } catch (e) {
      fail(e)
    }
  })

  it("should request items by user", async function () {
    try {
      await EthereumAsset.getItemsByUser()
    } catch (e) {
      fail(e)
    }
  })

  it("should request transfer", async function () {
    const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
    const to = "0xdC75e8c3aE765D8947aDBC6698a2403A6141D439"
    const tokenId =
      "80322369037599879817130611650014995038071054105692890356259348959353817268226"
    try {
      await EthereumAsset.transferNft(to, contract, tokenId)
    } catch (e) {
      expect(JSON.stringify(e)).toContain(
        "transfer caller is not owner nor approved",
      )
    }
  })
})
