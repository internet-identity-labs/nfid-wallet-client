import { BigNumber } from "@rarible/utils"

import { ethereumAsset } from "./asset-ethereum"
import { ChainBalance } from "./types"

describe("Ethereum Asset", () => {
  jest.setTimeout(20000)

  it("should return one fungible native tx", async function () {
    const actual = await ethereumAsset.getFungibleActivityByTokenAndUser({
      size: 1,
      sort: "asc",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
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
    })
  })

  it("should return one fungible erc20 tx", async function () {
    const actual = await ethereumAsset.getFungibleActivityByTokenAndUser({
      contract: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
      size: 1,
      sort: "asc",
      direction: "to",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
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
    })
  })

  it("should return one fungible erc20 token", async function () {
    const actual = await ethereumAsset.getErc20TokensByUser()
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
    const balance: ChainBalance = await ethereumAsset.getBalance()
    expect(balance).toMatchObject({
      balance: expect.any(BigNumber),
      balanceinUsd: expect.any(BigNumber),
    })
  })

  it("should request activities by item", async function () {
    const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
    const tokenId =
      "88260187566799326202913268841041605580353496351673437472672373155789474365442"
    const activities = await ethereumAsset.getActivitiesByItem({
      contract,
      tokenId,
      size: 1,
      sort: "asc",
    })

    expect(activities).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          id: "ETHEREUM:63c7d2161020c105300ae228",
          type: "TRANSFER",
          date: "2023-01-18T11:03:48Z",
          from: "ETHEREUM:0xc3217ef1d6027b5ad5404b21a911b952b5f728b4",
          to: "ETHEREUM:0x2209da095ba4a0e55d96745006ad3df747f06a3b",
          transactionHash:
            "0x7db526539a7e6c0e5532d6ee60b6f7530e83cce70c5972d10bdd1900401815a0",
        },
      ],
    })
  })

  it("should request activities by user", async function () {
    const activities = await ethereumAsset.getActivitiesByUser({
      size: 1,
      sort: "asc",
    })
    expect(activities).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          id: "ETHEREUM:63cebfa5e32fa77caef04084",
          type: "SELL",
          date: "2023-01-23T17:11:00Z",
          to: "ETHEREUM:0x382901144a77bec53493fa090053b9c63da5dd07",
          from: "ETHEREUM:0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
          transactionHash:
            "0xfe38a1136ab602dee254731dd38609d61cd474d57a0bad314ef2c1f035da3101",
          price: "0.001",
          priceUsd: "1.6268369969210553",
        },
      ],
    })
  })

  it("should request items by user", async function () {
    const items = await ethereumAsset.getItemsByUser({ size: 1 })
    expect(items).toEqual({
      total: 5,
      items: [
        {
          id: "ETHEREUM:0x1f419b9469d641d333805c4054ca3b65af54d315:1653",
          tokenId: "1653",
          contract: "0x1f419b9469d641d333805c4054ca3b65af54d315",
          collection: "0x1f419b9469d641d333805c4054ca3b65af54d315",
          blockchain: "ETHEREUM",
          lastUpdatedAt: expect.any(String),
          thumbnail:
            "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-goerli/59574aaf4d245619066f319901075a03",
          image:
            "https://nft-cdn.alchemy.com/eth-goerli/59574aaf4d245619066f319901075a03",
          title: "Snake #1653",
          description:
            "A research project by DEPT® for generating and running interactive NFTs.",
          tokenType: "ERC721",
          contractName: "Snakes on a chain",
          contractSymbol: "SNAKE",
        },
      ],
    })
  })

  // @Dmitrii please check it
  // it("should request transfer", async function () {
  //   const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
  //   const to = "0xdC75e8c3aE765D8947aDBC6698a2403A6141D439"
  //   const tokenId =
  //     "80322369037599879817130611650014995038071054105692890356259348959353817268226"
  //   try {
  //     await ethereumAsset.transferNft(to, contract, tokenId)
  //   } catch (e) {
  //     expect(JSON.stringify(e)).toContain(
  //       "transfer caller is not owner nor approved",
  //     )
  //   }
  // })
})
