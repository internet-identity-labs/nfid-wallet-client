/**
 * @jest-environment jsdom
 */
import {nftGeekService} from "src/integration/nft/geek/nft-geek-service";
import {mockGeekResponse} from "src/integration/nft/mock/mock";
import {nftService} from "src/integration/nft/nft-service";
import {Principal} from "@dfinity/principal";
import {
  SaleTransactionRecord,
  TransferTransactionRecord
} from "src/integration/nft/impl/transaction/ext/ext-transactions";


const principal = Principal.fromText("j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae")

describe("nft test suite", () => {
  describe("ext", () => {
    it("should return", async () => {
      jest.spyOn(nftGeekService as any, 'fetchNftGeekData').mockResolvedValue(mockGeekResponse);
      const result = await nftService.getNFTs(principal)
      expect(result).toHaveLength(4)

      //collectibles page
      const extNft = result[1]
      expect(extNft.getTokenNumber()).toEqual(2066)
      expect(extNft.getCollectionId()).toEqual('64x4q-laaaa-aaaal-qdjca-cai')
      expect(extNft.getCollectionName()).toEqual('Cellphones')
      expect(extNft.getTokenName()).toEqual('Cellphones # 2066')
      expect(extNft.getTokenFloorPriceIcp()).toEqual(4500000)
      expect(extNft.getTokenFloorPriceUSD()).toEqual(4607)
      expect(extNft.getTokenId()).toEqual('yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a')
      expect(extNft.getMarketPlace()).toEqual('EXT')
      expect(extNft.getMillis()).toEqual(1721253726158)
      expect(extNft.getAssetPreview().format).toEqual('img')
      expect(extNft.getAssetPreview().url).toEqual("https://images.entrepot.app/t/64x4q-laaaa-aaaal-qdjca-cai/yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a")
      expect(extNft.getTokenLink()).toEqual("https://64x4q-laaaa-aaaal-qdjca-cai.raw.ic0.app/?tokenid=yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a")

      //details page
      const details = await extNft.getDetails()
      expect(details.getAbout()).toEqual( "Cellphones on ICP ringing throughout the cryptoverse.")
      const assetFullSize = await details.getAssetFullSize()
      expect(assetFullSize.format).toEqual('img')
      expect(assetFullSize.url).toEqual("https://images.entrepot.app/t/64x4q-laaaa-aaaal-qdjca-cai/yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a")

      const transactions = await details.getTransactions(0,10)
      expect(transactions.activity).toHaveLength(2)
      const transfer = transactions.activity[0] as TransferTransactionRecord
      expect(transfer.getType()).toEqual('TRANSFER')
      expect(transfer.getDate().toISOString()).toEqual("2024-07-17T14:21:58.748Z")
      expect(transfer.getFrom()).toEqual("126dfe340b012f97969bede78808b3f16734d8362c4fe37d3d219f74a78ff157")
      expect(transfer.getTo()).toEqual("f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99")

      const soldNFTDetails = await result[0].getDetails()
      const soldNFTTransactions = await soldNFTDetails.getTransactions(0,10)
      expect(soldNFTTransactions.activity).toHaveLength(1)
      const sale = soldNFTTransactions.activity[0] as SaleTransactionRecord
      expect(sale.getType()).toEqual('SALE')
      expect(sale.getDate().toISOString()).toEqual("2022-01-18T05:29:26.428Z")
      expect(sale.getFrom()).toEqual("f7sgc-7glh6-n67he-ollmd-dpy26-2xdbo-vyzxo-pbboq-vkb6v-vfu4f-uqe")
      expect(sale.getTo()).toEqual('550660832ce68b21bbcc5af42e0db30ce87abfffbf41f99a8b9c0de80d58face')
    })
  })
})
