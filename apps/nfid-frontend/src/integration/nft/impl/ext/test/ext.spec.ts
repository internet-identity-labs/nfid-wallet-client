/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { mockGeekResponse } from "src/integration/nft/mock/mock"
import { nftService } from "src/integration/nft/nft-service"

import { exchangeRateService } from "@nfid/integration"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("nft test suite", () => {
  jest.setTimeout(35000)
  describe("nft", () => {
    it("should return", async () => {
      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      jest
        .spyOn(exchangeRateService as any, "getICP2USD")
        .mockReturnValue(new BigNumber(8.957874722))
      const result = await nftService.getNFTs(principal, 1, 100)
      await Promise.all(result.items.map(async (nft) => nft.init()))
      //collectibles page
      const extNft = result.items.filter(
        (nft) => nft.getCollectionId() === "64x4q-laaaa-aaaal-qdjca-cai",
      )[0]
      expect(extNft.getTokenNumber()).toEqual(2066)
      expect(extNft.getCollectionId()).toEqual("64x4q-laaaa-aaaal-qdjca-cai")
      expect(extNft.getCollectionName()).toEqual("Cellphones")
      expect(extNft.getTokenName()).toEqual("Cellphones #2066")
      expect(extNft.getTokenFloorPriceIcpFormatted()).toEqual("0.02 ICP")
      expect(extNft.getTokenFloorPriceUSDFormatted()).toEqual("0.18 USD")
      expect(extNft.getTokenId()).toEqual(
        "yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )
      expect(extNft.getMarketPlace()).toEqual("EXT")
      expect(extNft.getMillis()).toEqual(1721253726158)
      const extAssetPreview = extNft.getAssetPreview()
      expect(extAssetPreview.format).toEqual("img")
      expect(extAssetPreview.url).toEqual(
        "https://images.entrepot.app/t/64x4q-laaaa-aaaal-qdjca-cai/yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )
      expect(extNft.getTokenLink()).toEqual(
        "https://64x4q-laaaa-aaaal-qdjca-cai.raw.ic0.app/?tokenid=yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )

      //details page
      const details = await extNft.getDetails()
      expect(details.getAbout()).toEqual(
        "Cellphones on ICP ringing throughout the cryptoverse.",
      )
      const assetFullSize = await details.getAssetFullSize()
      expect(assetFullSize.format).toEqual("img")
      expect(assetFullSize.url).toEqual(
        "https://images.entrepot.app/t/64x4q-laaaa-aaaal-qdjca-cai/yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )

      const transactions = await details.getTransactions(0, 10)
      expect(transactions.activity).toHaveLength(2)
      const transfer = transactions.activity[0].getTransactionView()
      expect(transfer.getType()).toEqual("Transfer")
      expect(transfer.getFormattedDate()).toEqual("Jul 17, 2024 - 02:21:58 pm")
      expect(transfer.getFrom()).toEqual(
        "126dfe340b012f97969bede78808b3f16734d8362c4fe37d3d219f74a78ff157",
      )
      expect(transfer.getTo()).toEqual(
        "f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99",
      )

      const soldNFTDetails = await result.items
        .filter(
          (nft) => nft.getCollectionId() === "p5jg7-6aaaa-aaaah-qcolq-cai",
        )[0]
        .getDetails()

      const soldNFTTransactions = await soldNFTDetails.getTransactions(0, 10)
      expect(soldNFTTransactions.activity).toHaveLength(1)
      const sale = soldNFTTransactions.activity[0].getTransactionView()
      expect(sale.getType()).toEqual("Sale")
      expect(sale.getFormattedDate()).toEqual("Jan 18, 2022 - 05:29:26 am")
      expect(sale.getFrom()).toEqual(
        "f7sgc-7glh6-n67he-ollmd-dpy26-2xdbo-vyzxo-pbboq-vkb6v-vfu4f-uqe",
      )
      expect(sale.getTo()).toEqual(
        "550660832ce68b21bbcc5af42e0db30ce87abfffbf41f99a8b9c0de80d58face",
      )
      expect(sale.getFormattedPrice()).toEqual("0.188 ICP")

      const extNftWithTrsFromMarketPlace = result.items.filter(
        (nft) => nft.getCollectionId() === "ok3ug-2iaaa-aaaag-qbilq-cai",
      )[0]
      const detailsTrsFromMarketPlace =
        await extNftWithTrsFromMarketPlace.getDetails()
      const transactionsTrsFromMarketPlace =
        await detailsTrsFromMarketPlace.getTransactions(0, 10)
      expect(transactionsTrsFromMarketPlace.activity).toHaveLength(2)
      const saleToniq =
        transactionsTrsFromMarketPlace.activity[0].getTransactionView()
      expect(saleToniq.getType()).toEqual("Sale")
      expect(saleToniq.getFormattedDate()).toEqual("Jun 04, 2024 - 10:50:45 am")
      expect(saleToniq.getFrom()).toEqual(
        "1fb5168efca2361a979e5132ddb88eff493165545a50966336b79e3778e2ff88",
      )
      expect(saleToniq.getTo()).toEqual(
        "7effb2346414c16572c3475cb69e02cb258699085fb9103f6156c13204ae77cf",
      )
      expect(saleToniq.getFormattedPrice()).toEqual("0.01 ICP")
    })
  })
})