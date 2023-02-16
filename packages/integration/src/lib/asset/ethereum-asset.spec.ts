import { BigNumber } from "@rarible/utils"

import { Balance, EthereumAsset } from "./ethereum-asset"

describe("Ethereum Asset", () => {
  jest.setTimeout(200000)

  it("should return one fungible native tx", async function () {
    const actual = await EthereumAsset.getFungibleActivityByTokenAndUser({
      size: 1,
      sort: "asc",
    })
    expect(actual).toEqual(
      expect.objectContaining({
        activities: [
          {
            date: "2023-01-23T17:11:00.000Z",
            from: "0x382901144a77bec53493fa090053b9c63da5dd07",
            id: "0xfe38a1136ab602dee254731dd38609d61cd474d57a0bad314ef2c1f035da3101:external",
            price: 0.001,
            to: "0x02afbd43cad367fcb71305a2dfb9a3928218f0c1",
            transactionHash:
              "0xfe38a1136ab602dee254731dd38609d61cd474d57a0bad314ef2c1f035da3101",
          },
        ],
      }),
    )
  })

  it("should return one fungible erc20 tx", async function () {
    const actual = await EthereumAsset.getFungibleActivityByTokenAndUser({
      contract: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
      size: 1,
      sort: "asc",
      direction: "to",
    })
    expect(actual).toEqual(
      expect.objectContaining({
        activities: [
          {
            date: "2023-02-14T15:05:00.000Z",
            from: "0x4281ecf07378ee595c564a59048801330f3084ee",
            id: "0xa1a5a26750235ec8a8a65110926932befd67351e01ee19bfb20f8d01dab24f2c:log:32",
            price: 10,
            to: "0x382901144a77bec53493fa090053b9c63da5dd07",
            transactionHash:
              "0xa1a5a26750235ec8a8a65110926932befd67351e01ee19bfb20f8d01dab24f2c",
          },
        ],
      }),
    )
  })

  it("should return one fungible erc20 token", async function () {
    const actual = await EthereumAsset.getErc20TokensByUser()
    expect(actual).toEqual({
      cursor: undefined,
      tokens: [
        {
          name: "ChainLink Token",
          symbol: "LINK",
          logo: undefined,
          balance: "10.0",
          contractAddress: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
        },
      ],
    })
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
