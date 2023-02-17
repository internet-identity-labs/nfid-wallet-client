import { BigNumber } from "@rarible/utils"

import { polygonAsset } from "./asset-ethereum"
import { Balance } from "./types"

describe("Polygon Asset", () => {
  jest.setTimeout(20000)

  it("should return one fungible native tx", async function () {
    const actual = await polygonAsset.getFungibleActivityByTokenAndUser({
      size: 1,
      sort: "asc",
    })
    expect(actual).toEqual(
      expect.objectContaining({
        activities: [
          {
            date: "2023-02-07T15:40:17.000Z",
            from: "0x382901144a77bec53493fa090053b9c63da5dd07",
            id: "0x1a821c20741e9ff6dfe148cf4ff2b44c5064e2b3b86cbe720c8a638c8b93ad1c:external",
            price: 0.01,
            to: "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
            transactionHash:
              "0x1a821c20741e9ff6dfe148cf4ff2b44c5064e2b3b86cbe720c8a638c8b93ad1c",
          },
        ],
      }),
    )
  })

  it("should return one fungible erc20 tx", async function () {
    const actual = await polygonAsset.getFungibleActivityByTokenAndUser({
      contract: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
      size: 1,
      sort: "asc",
      direction: "to",
    })
    expect(actual).toEqual(
      expect.objectContaining({
        activities: [
          {
            date: "2023-02-17T14:45:35.000Z",
            from: "0xd5b31fb565d608692d6422beb31bf0875dad4fc3",
            id: "0xc569a7bd93bb29138b1374ce293469f7da1e2b662314e5ae27c44253a847c524:log:16",
            price: 100,
            to: "0x382901144a77bec53493fa090053b9c63da5dd07",
            transactionHash:
              "0xc569a7bd93bb29138b1374ce293469f7da1e2b662314e5ae27c44253a847c524",
          },
        ],
      }),
    )
  })

  it("should return one fungible erc20 token", async function () {
    const actual = await polygonAsset.getErc20TokensByUser()
    expect(actual).toEqual({
      cursor: undefined,
      tokens: [
        {
          name: "USD Coin",
          symbol: "USDC",
          logo: undefined,
          balance: "100.0",
          contractAddress: "0xe097d6b3100777dc31b34dc2c58fb524c2e76921",
        },
      ],
    })
  })

  it("should request balance", async function () {
    const balance: Balance = await polygonAsset.getBalance()
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
      await polygonAsset.getActivitiesByItem(contract, tokenId)
    } catch (e) {
      fail(e)
    }
  })

  it("should request activities by user", async function () {
    try {
      await polygonAsset.getActivitiesByUser()
    } catch (e) {
      console.log(e)
      fail(e)
    }
  })

  it("should request items by user", async function () {
    try {
      await polygonAsset.getItemsByUser()
    } catch (e) {
      console.log(e)
      fail(e)
    }
  })

  it("should request transfer", async function () {
    const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
    const to = "0xdC75e8c3aE765D8947aDBC6698a2403A6141D439"
    const tokenId =
      "80322369037599879817130611650014995038071054105692890356259348959353817268226"
    try {
      await polygonAsset.transferNft(to, contract, tokenId)
    } catch (e) {
      expect(JSON.stringify(e)).toContain(
        "transfer caller is not owner nor approved",
      )
    }
  })
})
