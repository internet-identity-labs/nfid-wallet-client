import { BigNumber } from "@rarible/utils"

import { polygonAsset } from "./asset-ethereum"
import { ChainBalance } from "./types"

describe("Polygon Asset", () => {
  jest.setTimeout(20000)

  it("should return one fungible native tx", async function () {
    const actual = await polygonAsset.getFungibleActivityByTokenAndUser({
      size: 1,
      sort: "asc",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          id: "0x1a821c20741e9ff6dfe148cf4ff2b44c5064e2b3b86cbe720c8a638c8b93ad1c:external",
          date: "2023-02-07T15:40:17.000Z",
          to: "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
          from: "0x382901144a77bec53493fa090053b9c63da5dd07",
          transactionHash:
            "0x1a821c20741e9ff6dfe148cf4ff2b44c5064e2b3b86cbe720c8a638c8b93ad1c",
          price: 0.01,
        },
      ],
    })
  })

  it("should return one fungible erc20 tx", async function () {
    const actual = await polygonAsset.getFungibleActivityByTokenAndUser({
      contract: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
      size: 1,
      sort: "asc",
      direction: "to",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          id: "0xc569a7bd93bb29138b1374ce293469f7da1e2b662314e5ae27c44253a847c524:log:16",
          date: "2023-02-17T14:45:35.000Z",
          to: "0x382901144a77bec53493fa090053b9c63da5dd07",
          from: "0xd5b31fb565d608692d6422beb31bf0875dad4fc3",
          transactionHash:
            "0xc569a7bd93bb29138b1374ce293469f7da1e2b662314e5ae27c44253a847c524",
          price: 100,
        },
      ],
    })
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
    const balance: ChainBalance = await polygonAsset.getBalance({})
    expect(balance).toMatchObject({
      balance: expect.any(BigNumber),
      balanceinUsd: expect.any(BigNumber),
    })
  })

  it("should request activities by item", async function () {
    const contract = "0x2953399124f0cbb46d2cbacd8a89cf0599974963"
    const tokenId =
      "25340927624470057327886108971339045949703948342541401788851146193678729479144"
    const activities = await polygonAsset.getActivitiesByItem({
      contract,
      tokenId,
      size: 1,
      sort: "asc",
    })

    expect(activities).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          id: "POLYGON:63bfd52391b2831cffcff0be",
          type: "TRANSFER",
          date: "2023-01-05T07:07:09Z",
          from: "ETHEREUM:0x380674ee168d258baa2825be55b57628c150099b",
          to: "ETHEREUM:0x722fe0d1dbe893edd76a63832c08cb3801069c00",
          transactionHash:
            "0x15c9d5bd5389a3f551cd92ba4478956e5c5edb8ed282fae54a51f7230fa129c4",
        },
      ],
    })
  })

  it("should request activities by user", async function () {
    const activities = await polygonAsset.getActivitiesByUser({
      size: 1,
      sort: "asc",
    })

    expect(activities).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          id: "POLYGON:63ef8fc49b7e157fa48bedff",
          type: "TRANSFER",
          date: "2023-02-17T14:31:31Z",
          from: "ETHEREUM:0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
          to: "ETHEREUM:0x382901144a77bec53493fa090053b9c63da5dd07",
          transactionHash:
            "0xa317ed05be5fd7c9d420e273759fdc6094908d5322b6cfd6e287433f61b5419d",
        },
      ],
    })
  })

  it("should request items by user", async function () {
    const items = await polygonAsset.getItemsByUser({ size: 1 })
    expect(items).toEqual({
      total: undefined,
      items: expect.any(Array),
    })
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
