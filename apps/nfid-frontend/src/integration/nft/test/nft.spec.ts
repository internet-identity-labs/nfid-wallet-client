/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { mockGeekResponse } from "src/integration/nft/mock/mock"
import { nftService } from "src/integration/nft/nft-service"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("nft test suite", () => {
  jest.setTimeout(25000)
  describe("ext", () => {
    it("should return", async () => {
      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      const result = await nftService.getNFTs(principal)
      expect(result).toHaveLength(8)

      //collectibles page
      const extNft = result.filter(
        (nft) => nft.getCollectionId() === "64x4q-laaaa-aaaal-qdjca-cai",
      )[0]
      expect(extNft.getTokenNumber()).toEqual(2066)
      expect(extNft.getCollectionId()).toEqual("64x4q-laaaa-aaaal-qdjca-cai")
      expect(extNft.getCollectionName()).toEqual("Cellphones")
      expect(extNft.getTokenName()).toEqual("Cellphones # 2066")
      expect(extNft.getTokenFloorPriceIcp()).toEqual(4500000)
      expect(extNft.getTokenFloorPriceUSD()).toEqual(4607)
      expect(extNft.getTokenId()).toEqual(
        "yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )
      expect(extNft.getMarketPlace()).toEqual("EXT")
      expect(extNft.getMillis()).toEqual(1721253726158)
      const extAssetPreview = await extNft.getAssetPreview()
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
      expect(transfer.type).toEqual("Transfer")
      expect(transfer.date).toEqual("2024-07-17T14:21:58.748Z")
      expect(transfer.from).toEqual(
        "126dfe340b012f97969bede78808b3f16734d8362c4fe37d3d219f74a78ff157",
      )
      expect(transfer.to).toEqual(
        "f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99",
      )

      const soldNFTDetails = await result[0].getDetails()
      const soldNFTTransactions = await soldNFTDetails.getTransactions(0, 10)
      expect(soldNFTTransactions.activity).toHaveLength(1)
      const sale = soldNFTTransactions.activity[0].getTransactionView()
      expect(sale.type).toEqual("Sale")
      expect(sale.date).toEqual("2022-01-18T05:29:26.428Z")
      expect(sale.from).toEqual(
        "f7sgc-7glh6-n67he-ollmd-dpy26-2xdbo-vyzxo-pbboq-vkb6v-vfu4f-uqe",
      )
      expect(sale.to).toEqual(
        "550660832ce68b21bbcc5af42e0db30ce87abfffbf41f99a8b9c0de80d58face",
      )
      expect(sale.price).toEqual("0.188 ICP")

      //verify YUMI interface

      const yumiNFT = result.filter(
        (nft) => nft.getCollectionId() === "yzrp5-oaaaa-aaaah-ad2xa-cai",
      )[0]
      expect(yumiNFT.getTokenNumber()).toEqual(9103)
      expect(yumiNFT.getCollectionId()).toEqual("yzrp5-oaaaa-aaaah-ad2xa-cai")
      expect(yumiNFT.getCollectionName()).toEqual("Mifoko")
      expect(yumiNFT.getTokenName()).toEqual("Mifoko # 9103")
      //geek does not return us price for ths token
      expect(yumiNFT.getTokenFloorPriceIcp()).toEqual(undefined)
      expect(yumiNFT.getTokenFloorPriceUSD()).toEqual(undefined)
      expect(yumiNFT.getTokenId()).toEqual(
        "h5nvt-iykor-uwiaa-aaaaa-bya6v-yaqca-aaeoh-q",
      )
      expect(yumiNFT.getMarketPlace()).toEqual("YUMI")
      expect(yumiNFT.getMillis()).toEqual(1721253579367)
      const yumiNftAssetPreview = await yumiNFT.getAssetPreview()
      expect(yumiNftAssetPreview.format).toEqual("img")
      expect(yumiNftAssetPreview.url).toEqual(
        "https://images.entrepot.app/t/yzrp5-oaaaa-aaaah-ad2xa-cai/h5nvt-iykor-uwiaa-aaaaa-bya6v-yaqca-aaeoh-q",
      )
      //todo link does not work
      expect(yumiNFT.getTokenLink()).toEqual(
        "https://yzrp5-oaaaa-aaaah-ad2xa-cai.raw.ic0.app/?tokenid=h5nvt-iykor-uwiaa-aaaaa-bya6v-yaqca-aaeoh-q",
      )

      const yumiNFTdetails = await yumiNFT.getDetails()
      expect(yumiNFTdetails.getAbout()).toEqual(
        "Mifoko is a commemorative collection by the MotokoWifHat team honoring Motoko Ghosts NFT collection, exclusively airdropped to Motoko Ghosts NFT holders and Sneed DAO members. This collection features 10,000 different, hand-curated pieces using a unique and original crayon-art style.",
      )
      const yumiNFTassetFullSize = await yumiNFTdetails.getAssetFullSize()
      expect(yumiNFTassetFullSize.format).toEqual("img")
      expect(yumiNFTassetFullSize.url).toEqual(
        "https://bafybeidpxzxggojap5uusofoho5y4j6qbsiitljjobrc4s2wmwtbbcxshi.ipfs.w3s.link/20240517-140134.png",
      )

      const yumiNFTtransactions = await yumiNFTdetails.getTransactions(0, 10)
      expect(yumiNFTtransactions.activity).toHaveLength(9)
      expect(yumiNFTtransactions.isLastPage).toBeTruthy()

      const listYumiActivity =
        yumiNFTtransactions.activity[8].getTransactionView()
      expect(listYumiActivity.type).toEqual("List")
      expect(listYumiActivity.to).toEqual(undefined)
      expect(listYumiActivity.from).toEqual(
        "287f1d6bd92892c983c21135b4319eba0cb838a6e1f446cae820d707bc21de77",
      )
      expect(listYumiActivity.date).toEqual("2024-06-03T14:06:33.689Z")
      expect(listYumiActivity.price).toEqual("3 ICP")

      const soldYumiActivity =
        yumiNFTtransactions.activity[0].getTransactionView()
      expect(soldYumiActivity.type).toEqual("Sale")
      expect(soldYumiActivity.to).toEqual(
        "f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99",
      )
      expect(soldYumiActivity.from).toEqual(
        "287f1d6bd92892c983c21135b4319eba0cb838a6e1f446cae820d707bc21de77",
      )
      expect(soldYumiActivity.date).toEqual("2024-07-17T14:01:34.027Z")
      expect(listYumiActivity.price).toEqual("3 ICP")

      //memecake interface

      const memecakeNft = result.filter(
        (nft) => nft.getCollectionId() === "gdeb6-lqaaa-aaaah-abvpq-cai",
      )[0]
      expect(memecakeNft.getTokenNumber()).toEqual(5002)
      expect(memecakeNft.getCollectionName()).toEqual("Boxy Land")
      expect(memecakeNft.getTokenName()).toEqual("Boxy Land # 5002")

      //TODO geek does not return us price for ths token
      expect(memecakeNft.getTokenFloorPriceIcp()).toEqual(undefined)
      expect(memecakeNft.getTokenFloorPriceUSD()).toEqual(undefined)
      expect(memecakeNft.getTokenId()).toEqual(
        "ubfjy-6qkor-uwiaa-aaaaa-byanl-4aqca-aacof-a",
      )
      expect(memecakeNft.getMarketPlace()).toEqual("MEMECAKE")
      expect(memecakeNft.getMillis()).toEqual(1721253870829)
      const memcakeAsset = await memecakeNft.getAssetPreview()
      expect(memcakeAsset.format).toEqual("img")
      expect(memcakeAsset.url).toEqual(
        "https://images.entrepot.app/t/gdeb6-lqaaa-aaaah-abvpq-cai/ubfjy-6qkor-uwiaa-aaaaa-byanl-4aqca-aacof-a",
      )
      const memeCakeDetails = await memecakeNft.getDetails()
      expect(memeCakeDetails.getAbout()).toEqual(
        "Boxy Land will play a significant role in the Boxyverse. Each has a unique blend of environment and sediment — some with resources, some home to powerful artifacts. And a very few original lands.",
      )
      const memecakeAssetFullSize = await memeCakeDetails.getAssetFullSize()
      expect(memecakeAssetFullSize.url).toEqual(
        "https://gdeb6-lqaaa-aaaah-abvpq-cai.raw.ic0.app/?tokenid=ubfjy-6qkor-uwiaa-aaaaa-byanl-4aqca-aacof-a",
      )
      //TODO retrieve somehow correct format
      expect(memecakeAssetFullSize.format).toEqual("img")

      const memecakeTransactions = await memeCakeDetails.getTransactions(0, 10)
      expect(memecakeTransactions.activity).toHaveLength(2)
      expect(memecakeTransactions.isLastPage).toBeTruthy()

      const soldMemecakeActivity =
        memecakeTransactions.activity[0].getTransactionView()
      expect(soldMemecakeActivity.type).toEqual("Sale")
      expect(soldMemecakeActivity.price).toEqual("0.45 ICP")
      expect(soldMemecakeActivity.date).toEqual("2024-07-17T22:02:35.191Z")
      expect(soldMemecakeActivity.from).toEqual(
        "dqowy-h2khv-z73ww-duwdp-3d5ri-sgbfk-v6j4y-apzxj-mxusr-mdbys-yqe",
      )
      expect(soldMemecakeActivity.to).toEqual(
        "fnitq-gnnyu-622b6-uucy7-jsrpw-biift-nb6bf-2iu2s-lks7w-4bxys-vqe",
      )

      //ICPSWAP

      const icpswapNft = result.filter(
        (nft) => nft.getCollectionId() === "gfcya-pyaaa-aaaan-qbxda-cai",
      )[0]
      const icpswapAsset = await icpswapNft.getAssetPreview()
      expect(icpswapAsset.format).toEqual("video")
      expect(icpswapAsset.url).toEqual("https://gfcya-pyaaa-aaaan-qbxda-cai.raw.ic0.app/100000")
      expect(icpswapNft.getTokenFloorPriceIcp()).toEqual(20000000)
      expect(icpswapNft.getTokenFloorPriceUSD()).toEqual(20478)
      const icpswapDetails = await icpswapNft.getDetails()
      expect(icpswapDetails.getAbout()).toEqual("The SNS&GHOST NFT Gifts for the $GHOST Community.")
      const icpswapTransactions = await icpswapDetails.getTransactions(0, 10)
      expect(icpswapTransactions.activity).toHaveLength(3)
      expect(icpswapTransactions.isLastPage).toBeTruthy()
      const icpswapActivity = icpswapTransactions.activity[0].getTransactionView()
      expect(icpswapActivity.type).toEqual("Transfer")
      expect(icpswapActivity.price).toEqual(undefined)
      expect(icpswapActivity.date).toEqual("2024-07-17T21:57:56.590Z")
      expect(icpswapActivity.from).toEqual(
        "f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99",
      )
      expect(icpswapActivity.to).toEqual("0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df")

      const icpswapActivityMint = icpswapTransactions.activity[2].getTransactionView()
      expect(icpswapActivityMint.type).toEqual("Mint")
      expect(icpswapActivityMint.price).toEqual("0 ICP")
      expect(icpswapActivityMint.date).toEqual("2022-12-07T08:53:48.919Z")
      expect(icpswapActivityMint.from).toEqual(undefined)
      expect(icpswapActivityMint.to).toEqual("af8283ad383bc6e16509683b3256fdb4a5d2ece25261e8c39b1677bab7019e44")
    })
  })
})
