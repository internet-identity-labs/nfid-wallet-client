import { Ed25519KeyIdentity, DelegationIdentity } from "@dfinity/identity"

import { evmIdentity } from "../identity"
import { generateDelegationIdentity } from "../test-utils"
import { polygonMumbaiAsset } from "./asset-polygon"
import { ChainBalance } from "./types"

// SKIP: https://app.shortcut.com/the-internet-portal/story/11881/remove-rarible-unit-tests
// @Dmitrii to take a look and probably remove
describe.skip("Polygon Asset", () => {
  jest.setTimeout(20000)

  it("should return 1 activity for identity", async function () {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(evmIdentity)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    const actual = await polygonMumbaiAsset.getActivityByUser(
      delegationIdentity,
      5,
      "asc",
    )
    expect(actual).toEqual([
      {
        id: "0x870cde38995cbcffa5ab3d6dc17133bae9df3d4bb7233adcfed587df8cc97b46:external",
        date: new Date("2023-07-31T10:21:41.000Z"),
        to: "0x6a4b85a37ee98ae99cf995ff87fe35a8b23ea3ec",
        from: "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
        transactionHash:
          "0x870cde38995cbcffa5ab3d6dc17133bae9df3d4bb7233adcfed587df8cc97b46",
        action: "Received",
        asset: {
          type: "ft",
          currency: "MATIC",
          amount: 0.1,
        },
      },
      {
        action: "Received",
        date: new Date("2023-08-03T19:04:14.000Z"),
        from: "0x3b00b3deef27c8c680059558f546366666666666",
        id: "0x5f834e7acb72233e3ec0939a6f88bee48785ffcde1db678b6cbe209f2ac717d1:log:1727",
        to: "0x6a4b85a37ee98ae99cf995ff87fe35a8b23ea3ec",
        transactionHash:
          "0x5f834e7acb72233e3ec0939a6f88bee48785ffcde1db678b6cbe209f2ac717d1",
        asset: {
          amount: 6666666,
          currency: "VanityTron.io",
          type: "ft",
        },
      },
    ])
  })

  it.skip("should return one fungible native tx", async function () {
    const actual = await polygonMumbaiAsset.getFungibleActivityByTokenAndUser({
      address: "0x382901144a77bec53493fa090053b9c63da5dd07",
      size: 1,
      sort: "asc",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          asset: "MATIC",
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
    const actual = await polygonMumbaiAsset.getFungibleActivityByTokenAndUser({
      address: "0x382901144a77bec53493fa090053b9c63da5dd07",
      contract: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
      size: 1,
      sort: "asc",
      direction: "to",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          asset: "USDC",
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
    const actual = await polygonMumbaiAsset.getErc20TokensByUser({
      identity: "0x382901144a77bec53493fa090053b9c63da5dd07",
    })

    expect(actual).toEqual({
      cursor: undefined,
      tokens: [
        {
          name: "USD Coin",
          symbol: "USDC",
          logo: undefined,
          balance: "100.0",
          contractAddress: "0xe097d6b3100777dc31b34dc2c58fb524c2e76921",
          address: "0x382901144a77bec53493fa090053b9c63da5dd07",
          balanceinUsd: expect.any(String),
        },
      ],
    })
  })

  it("should request balance", async function () {
    const balance: ChainBalance = await polygonMumbaiAsset.getBalance(
      "0x382901144a77bec53493fa090053b9c63da5dd07",
    )
    expect(balance).toMatchObject({
      balance: expect.any(String),
      balanceinUsd: expect.any(String),
    })
  })

  it("should request activities by item", async function () {
    const contract = "0x2953399124f0cbb46d2cbacd8a89cf0599974963"
    const tokenId =
      "25340927624470057327886108971339045949703948342541401788851146193678729479144"
    const activities = await polygonMumbaiAsset.getActivitiesByItem({
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
          from: "0x380674ee168d258baa2825be55b57628c150099b",
          to: "0x722fe0d1dbe893edd76a63832c08cb3801069c00",
          transactionHash:
            "0x15c9d5bd5389a3f551cd92ba4478956e5c5edb8ed282fae54a51f7230fa129c4",
        },
      ],
    })
  })

  it("should request activities by user", async function () {
    const activities = await polygonMumbaiAsset.getActivitiesByUser({
      identity: "0x382901144a77bec53493fa090053b9c63da5dd07",
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
          from: "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
          to: "0x382901144a77bec53493fa090053b9c63da5dd07",
          transactionHash:
            "0xa317ed05be5fd7c9d420e273759fdc6094908d5322b6cfd6e287433f61b5419d",
        },
      ],
    })
  })

  it.skip("should request items by user", async function () {
    const items = await polygonMumbaiAsset.getItemsByUser({
      identity: "0x382901144a77bec53493fa090053b9c63da5dd07",
      size: 1,
    })
    expect(items).toEqual({
      total: 1,
      items: [
        {
          id: "POLYGON:0xa25ccf05ddb5d67d9ebfdea9b76fe3201b90d3ae:65478239585360661566186731368853181570115269014612076549743176376606543266369",
          tokenId:
            "65478239585360661566186731368853181570115269014612076549743176376606543266369",
          contract: "0xa25ccf05ddb5d67d9ebfdea9b76fe3201b90d3ae",
          collection: "0xa25ccf05ddb5d67d9ebfdea9b76fe3201b90d3ae",
          blockchain: "POLYGON",
          lastUpdatedAt: expect.any(String),
          thumbnail:
            "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/matic-mumbai/bb028732257939400ab526ce1e60a3f2",
          image:
            "https://ipfs.io/ipfs/bafybeie6at2xtadbnh4cy3hjevhundyyys46vr45s3fjzy66wzxtgoq4zi/image.png",
          title: "Test Gateway #22",
          description: "",
          tokenType: "ERC1155",
          contractName: "Meshplus Test Store Multi",
          contractSymbol: "MTSM",
          imageType: "image",
        },
      ],
    })
  })
})
