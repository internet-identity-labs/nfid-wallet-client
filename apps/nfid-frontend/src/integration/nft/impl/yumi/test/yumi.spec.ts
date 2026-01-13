/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"

import BigNumber from "bignumber.js"

import { exchangeRateService } from "@nfid/integration"

import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { mockGeekResponse } from "src/integration/nft/mock/mock"
import { nftService } from "src/integration/nft/nft-service"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("yumi test suite", () => {
  jest.setTimeout(35000)
  describe("nft", () => {
    it.skip("should return", async () => {
      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      jest
        .spyOn(exchangeRateService as any, "getICP2USD")
        .mockReturnValue(new BigNumber(8.957874722))
      const result = await nftService.getNFTs(principal, 1, 10)
      await Promise.all(result.items.map(async (nft) => nft.init()))

      const yumiNFT = result.items.filter(
        (nft) => nft.getCollectionId() === "yzrp5-oaaaa-aaaah-ad2xa-cai",
      )[0]
      expect(yumiNFT.getTokenNumber()).toEqual(9103)
      expect(yumiNFT.getCollectionId()).toEqual("yzrp5-oaaaa-aaaah-ad2xa-cai")
      expect(yumiNFT.getCollectionName()).toEqual("Mifoko")
      expect(yumiNFT.getTokenName()).toEqual("Mifoko #9103")
      //geek does not return us price for ths token
      expect(yumiNFT.getTokenFloorPriceIcpFormatted()).toEqual(undefined)
      expect(yumiNFT.getTokenFloorPriceUSDFormatted()).toEqual(undefined)
      expect(yumiNFT.getTokenId()).toEqual(
        "h5nvt-iykor-uwiaa-aaaaa-bya6v-yaqca-aaeoh-q",
      )
      expect(yumiNFT.getMarketPlace()).toEqual("YUMI")
      expect(yumiNFT.getMillis()).toEqual(1721253579367)
      const yumiNftAssetPreview = yumiNFT.getAssetPreview()
      expect(yumiNftAssetPreview?.format).toEqual("img")
      expect(yumiNftAssetPreview?.url).toEqual(
        "https://bafybeih6sox7rpgvnlhil3yvwdmeza6bzegdomdflgwbecsks3zedhsrc4.ipfs.w3s.link/9103_original.jpg",
      )
      //todo link does not work
      expect(yumiNFT.getTokenLink()).toEqual(
        "https://yzrp5-oaaaa-aaaah-ad2xa-cai.raw.icp0.io/?tokenid=h5nvt-iykor-uwiaa-aaaaa-bya6v-yaqca-aaeoh-q",
      )

      const yumiNFTdetails = await yumiNFT.getDetails()
      expect(yumiNFTdetails.getAbout()).toEqual(
        "Mifoko is a commemorative collection by the MotokoWifHat team honoring Motoko Ghosts NFT collection, exclusively airdropped to Motoko Ghosts NFT holders and Sneed DAO members. This collection features 10,000 different, hand-curated pieces using a unique and original crayon-art style.",
      )
      const yumiNFTassetFullSize = await yumiNFTdetails.getAssetFullSize()
      expect(yumiNFTassetFullSize.format).toEqual("img")
      expect(yumiNFTassetFullSize.url).toEqual(
        "https://bafybeih6sox7rpgvnlhil3yvwdmeza6bzegdomdflgwbecsks3zedhsrc4.ipfs.w3s.link/9103_original.jpg",
      )

      const yumiNFTProperties = await yumiNFTdetails.getProperties()
      expect(yumiNFTProperties.mappedValues.length).toEqual(0)

      const yumiNFTtransactions = await yumiNFTdetails.getTransactions(0, 10)
      expect(yumiNFTtransactions.activity).toHaveLength(9)
      expect(yumiNFTtransactions.isLastPage).toBeTruthy()

      const listYumiActivity =
        yumiNFTtransactions.activity[8].getTransactionView()
      expect(listYumiActivity.getType()).toEqual("List")
      expect(listYumiActivity.getTo()).toEqual(undefined)
      expect(listYumiActivity.getFrom()).toEqual(
        "287f1d6bd92892c983c21135b4319eba0cb838a6e1f446cae820d707bc21de77",
      )
      expect(listYumiActivity.getFormattedDate()).toEqual(
        "Jun 03, 2024 - 02:06:33 pm",
      )
      expect(listYumiActivity.getFormattedPrice()).toEqual("3 ICP")

      const soldYumiActivity =
        yumiNFTtransactions.activity[0].getTransactionView()
      expect(soldYumiActivity.getType()).toEqual("Sale")
      expect(soldYumiActivity.getTo()).toEqual(
        "f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99",
      )
      expect(soldYumiActivity.getFrom()).toEqual(
        "287f1d6bd92892c983c21135b4319eba0cb838a6e1f446cae820d707bc21de77",
      )
      expect(soldYumiActivity.getFormattedDate()).toEqual(
        "Jul 17, 2024 - 02:01:34 pm",
      )
      expect(listYumiActivity.getFormattedPrice()).toEqual("3 ICP")

      const yumiNFTWithDetails = result.items.filter(
        (nft) => nft.getCollectionId() === "fab4i-diaaa-aaaah-acr2q-cai",
      )[0]
      const yumiDetails = await yumiNFTWithDetails.getDetails()
      const yumiProperties = await yumiDetails.getProperties()
      expect(yumiProperties.mappedValues.length).toEqual(6)
      expect(yumiProperties.mappedValues[0].category).toEqual("1 of 1")
      expect(yumiProperties.mappedValues[0].option).toEqual("None")

      const image = yumiNFTWithDetails.getAssetPreview()
      expect(image?.format).toEqual("img")
      expect(image?.url).toEqual(
        "https://2kamf-liaaa-aaaam-abf5q-cai.raw.ic0.app/file/4612_original.gif",
      )
    })
  })
})
