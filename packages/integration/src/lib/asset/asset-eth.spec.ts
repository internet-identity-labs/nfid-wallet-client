import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { TransactionResponse } from "@ethersproject/abstract-provider"
import { BigNumber } from "@rarible/utils"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "../ecdsa-signer/signer-ecdsa"
import { mockIdentityA } from "../identity"
import { generateDelegationIdentity } from "../test-utils"
import { ethereumAsset } from "./asset-eth"
import { Erc20TransferRequest } from "./estimateTransaction/transferRequest/erc20TransferRequest"
import { EthTransferRequest } from "./estimateTransaction/transferRequest/ethTransferRequest"
import { NftErc721TransferRequest } from "./estimateTransaction/transferRequest/nftErc721TransferRequest"
import { NftErc1155TransferRequest } from "./estimateTransaction/transferRequest/nftErc1155TransferRequest"
import { ChainBalance } from "./types.d"

describe("Ethereum Asset", () => {
  jest.setTimeout(30000)

  it("should return one estimated erc20 tx", async function () {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)

    const request = new Erc20TransferRequest(
      delegationIdentity,
      "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      1,
    )

    const actual = await ethereumAsset.getEstimatedTransaction(request)
    expect(actual).toEqual({
      transaction: {
        from: "0x6a4b85A37ee98aE99cF995FF87fe35A8B23ea3eC",
        to: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        nonce: expect.any(Number),
        maxFeePerGas: expect.any(ethers.BigNumber),
        maxPriorityFeePerGas: expect.any(ethers.BigNumber),
        gasLimit: expect.any(ethers.BigNumber),
        data: "0xa9059cbb000000000000000000000000dc75e8c3ae765d8947adbc6698a2403a6141d4390000000000000000000000000000000000000000000000000de0b6b3a7640000",
      },
      fee: expect.any(String),
      feeUsd: expect.any(String),
      maxFee: expect.any(String),
      maxFeeUsd: expect.any(String),
    })
  })

  it("should return one estimated nft erc1155 tx", async function () {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)

    const request = new NftErc1155TransferRequest(
      delegationIdentity,
      "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
      1,
      "0xCB7E40c8DfBb6b83C7D222af862a6A1111D77897",
      "82484607247348712068732030314470275353650558748440325380375732522564550918146",
    )

    const actual = await ethereumAsset.getEstimatedTransaction(request)

    expect(actual).toEqual({
      transaction: {
        from: "0x6a4b85A37ee98aE99cF995FF87fe35A8B23ea3eC",
        to: "0xCB7E40c8DfBb6b83C7D222af862a6A1111D77897",
        nonce: expect.any(Number),
        maxFeePerGas: expect.any(ethers.BigNumber),
        maxPriorityFeePerGas: expect.any(ethers.BigNumber),
        gasLimit: expect.any(ethers.BigNumber),
        data: "0xf242432a0000000000000000000000006a4b85a37ee98ae99cf995ff87fe35a8b23ea3ec000000000000000000000000dc75e8c3ae765d8947adbc6698a2403a6141d439b65ca21d6396e0d8455bacaa1eb43cad27788f80000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
      },
      fee: expect.any(String),
      feeUsd: expect.any(String),
      maxFee: expect.any(String),
      maxFeeUsd: expect.any(String),
    })
  })

  it("should return one estimated nft erc721 tx", async function () {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)

    const request = new NftErc721TransferRequest(
      delegationIdentity,
      "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
      "0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9",
      "90954632668492117629724492447872876170185211583852507408636743397101359071345",
    )

    const actual = await ethereumAsset.getEstimatedTransaction(request)

    expect(actual).toEqual({
      transaction: {
        from: "0x6a4b85A37ee98aE99cF995FF87fe35A8B23ea3eC",
        to: "0xD8560C88D1DC85f9ED05b25878E366c49B68bEf9",
        nonce: expect.any(Number),
        maxFeePerGas: expect.any(ethers.BigNumber),
        maxPriorityFeePerGas: expect.any(ethers.BigNumber),
        gasLimit: expect.any(ethers.BigNumber),
        data: "0x42842e0e0000000000000000000000006a4b85a37ee98ae99cf995ff87fe35a8b23ea3ec000000000000000000000000dc75e8c3ae765d8947adbc6698a2403a6141d439c9167f6d465d3f38a4e8afd07cfdd529b1260f1a000000000000000000000071",
      },
      fee: expect.any(String),
      feeUsd: expect.any(String),
      maxFee: expect.any(String),
      maxFeeUsd: expect.any(String),
    })
  })

  it("should return hash with etherenet url after transfer", async () => {
    const walletSpy = jest.spyOn(EthWalletV2.prototype, "sendTransaction")
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const identity: DelegationIdentity = await generateDelegationIdentity(
      mockedIdentity,
    )
    const transaction: ethers.providers.TransactionRequest = {
      to: "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
      value: ethers.utils.parseEther("1"),
    }
    const expectedResponse: TransactionResponse = {
      hash: "0x35cbbf3a821d29c641eb3902683903fdb2e7337679dc6fe0fd208e3cd9e483fb",
    } as TransactionResponse

    walletSpy.mockResolvedValueOnce(expectedResponse)
    const result = await ethereumAsset.transfer(identity, transaction)

    expect(walletSpy).toHaveBeenCalledTimes(1)
    expect(walletSpy).toHaveBeenCalledWith(transaction)
    expect(result).toEqual(
      "https://goerli.etherscan.io/tx/0x35cbbf3a821d29c641eb3902683903fdb2e7337679dc6fe0fd208e3cd9e483fb",
    )

    walletSpy.mockRestore()
  })

  it("should return one estimated tx", async function () {
    const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(mockIdentityA)
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)

    const request = new EthTransferRequest(
      delegationIdentity,
      "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
      0.001,
    )
    const actual = await ethereumAsset.getEstimatedTransaction(request)
    expect(actual).toEqual({
      transaction: {
        from: "0x6a4b85A37ee98aE99cF995FF87fe35A8B23ea3eC",
        to: "0xdc75e8c3ae765d8947adbc6698a2403a6141d439",
        nonce: expect.any(Number),
        maxFeePerGas: expect.any(ethers.BigNumber),
        maxPriorityFeePerGas: expect.any(ethers.BigNumber),
        value: expect.any(ethers.BigNumber),
        gasLimit: expect.any(ethers.BigNumber),
      },
      fee: expect.any(String),
      feeUsd: expect.any(String),
      maxFee: expect.any(String),
      maxFeeUsd: expect.any(String),
    })
  })

  it("should return one fungible native tx", async function () {
    const actual = await ethereumAsset.getFungibleActivityByTokenAndUser({
      address: "0x382901144a77bec53493fa090053b9c63da5dd07",
      size: 1,
      sort: "asc",
    })
    expect(actual).toEqual({
      cursor: expect.any(String),
      activities: [
        {
          asset: "ETH",
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
          asset: "LINK",
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
    const actual = await ethereumAsset.getErc20TokensByUser({
      identity: "0x382901144a77bec53493fa090053b9c63da5dd07",
    })
    expect(actual).toEqual({
      cursor: undefined,
      tokens: [
        {
          name: "ChainLink Token",
          symbol: "LINK",
          logo: undefined,
          balance: BigInt(1000000000),
          contractAddress: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
          address: "0x382901144a77bec53493fa090053b9c63da5dd07",
          balanceinUsd: expect.any(String),
        },
      ],
    })
  })

  it("should request balance", async function () {
    const balance: ChainBalance = await ethereumAsset.getBalance(
      "0x382901144a77bec53493fa090053b9c63da5dd07",
    )
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
      identity: "0x382901144a77bec53493fa090053b9c63da5dd07",
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
    const items = await ethereumAsset.getItemsByUser({
      identity: "0x382901144a77bec53493fa090053b9c63da5dd07",
      size: 1,
    })
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
})
