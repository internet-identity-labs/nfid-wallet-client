/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { mockGeekResponse } from "src/integration/nft/mock/mock"
import { nftService } from "src/integration/nft/nft-service"

import { exchangeRateService } from "@nfid/integration"
import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"

import { NftImpl } from "../impl/nft-abstract"

const principal = Principal.fromText(
  "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
)

describe("nft test suite", () => {
  jest.setTimeout(100000)
  describe("nft", () => {
    it("should return", async () => {
      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      jest
        .spyOn(exchangeRateService as any, "getICP2USD")
        .mockReturnValue(new BigNumber(8.957874722))

      jest
        .spyOn(NftImpl.prototype as any, "getCanisterStatus")
        .mockImplementation(() => {
          console.log("Mocked getCanisterStatus called")
          return Promise.resolve(undefined)
        })

      const result = await nftService.getNFTs(principal, 1, 10)
      await Promise.all(result.items.map(async (nft) => nft.init()))
      expect(result.items).toHaveLength(10)
      expect(result.totalPages).toEqual(2)
      expect(result.currentPage).toEqual(1)
      expect(result.totalItems).toEqual(11)

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
      expect(extAssetPreview?.format).toEqual("img")
      expect(extAssetPreview?.url).toEqual(
        "https://images.entrepot.app/t/64x4q-laaaa-aaaal-qdjca-cai/yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )
      expect(extNft.getTokenLink()).toEqual(
        "https://64x4q-laaaa-aaaal-qdjca-cai.raw.icp0.io/?tokenid=yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )

      //details page
      const details = await extNft.getDetails()
      expect(details.getAbout()).toEqual(
        "Cellphones on ICP ringing throughout the cryptoverse.",
      )
      const assetFullSize = await details.getAssetFullSize()
      expect(assetFullSize.format).toEqual("img")
      expect(assetFullSize.url).toEqual(
        "https://64x4q-laaaa-aaaal-qdjca-cai.raw.icp0.io/?tokenid=yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )
      const soldNFTDetails = await result.items
        .filter(
          (nft) => nft.getCollectionId() === "p5jg7-6aaaa-aaaah-qcolq-cai",
        )[0]
        .getDetails()

      const soldNFTTransactions = await soldNFTDetails.getTransactions(0, 10)
      expect(soldNFTTransactions.activity).toHaveLength(3)
      const sale = soldNFTTransactions.activity
        .find(
          (s) =>
            s.getTransactionView().getFormattedDate() ===
            "Jan 18, 2022 - 05:29:26 am",
        )!
        .getTransactionView()
      expect(sale.getType()).toEqual("Sale")
      expect(sale.getFrom()).toEqual(
        "0743fccfa29a009676f1e759ae5c3744bb93a19db90bad2e65b9bd2a9dfe0fd2",
      )
      expect(sale.getTo()).toEqual(
        "550660832ce68b21bbcc5af42e0db30ce87abfffbf41f99a8b9c0de80d58face",
      )
      expect(sale.getFormattedPrice()).toEqual("0.188 ICP")
      //memecake interface

      const memecakeNft = result.items.filter(
        (nft) => nft.getCollectionId() === "gdeb6-lqaaa-aaaah-abvpq-cai",
      )[0]
      expect(memecakeNft.getTokenNumber()).toEqual(5002)
      expect(memecakeNft.getCollectionName()).toEqual("Boxy Land")
      expect(memecakeNft.getTokenName()).toEqual("Boxy Land #5002")

      //TODO geek does not return us price for ths token
      expect(memecakeNft.getTokenFloorPriceIcpFormatted()).toEqual(undefined)
      expect(memecakeNft.getTokenFloorPriceUSDFormatted()).toEqual(undefined)
      expect(memecakeNft.getTokenId()).toEqual(
        "ubfjy-6qkor-uwiaa-aaaaa-byanl-4aqca-aacof-a",
      )
      expect(memecakeNft.getMarketPlace()).toEqual("MEMECAKE")
      expect(memecakeNft.getMillis()).toEqual(1721253870829)
      const memcakeAsset = memecakeNft.getAssetPreview()
      expect(memcakeAsset?.format).toEqual("img")
      expect(memcakeAsset?.url).toEqual(
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
      expect(soldMemecakeActivity.getType()).toEqual("Sale")
      expect(soldMemecakeActivity.getFormattedPrice()).toEqual("0.45 ICP")
      expect(soldMemecakeActivity.getFormattedDate()).toEqual(
        "Jul 17, 2024 - 10:02:35 pm",
      )
      expect(soldMemecakeActivity.getFrom()).toEqual(
        "dqowy-h2khv-z73ww-duwdp-3d5ri-sgbfk-v6j4y-apzxj-mxusr-mdbys-yqe",
      )
      expect(soldMemecakeActivity.getTo()).toEqual(
        "fnitq-gnnyu-622b6-uucy7-jsrpw-biift-nb6bf-2iu2s-lks7w-4bxys-vqe",
      )

      //ICPSWAP

      const icpswapNft = result.items.filter(
        (nft) => nft.getCollectionId() === "gfcya-pyaaa-aaaan-qbxda-cai",
      )[0]
      const icpswapAsset = icpswapNft.getAssetPreview()
      expect(icpswapAsset?.format).toEqual("video")
      expect(icpswapAsset?.url).toEqual(
        "https://gfcya-pyaaa-aaaan-qbxda-cai.raw.ic0.app/100000",
      )
      expect(icpswapNft.getTokenFloorPriceIcpFormatted()).toEqual("0.2 ICP")
      expect(icpswapNft.getTokenFloorPriceUSDFormatted()).toEqual("1.79 USD")
      const icpswapDetails = await icpswapNft.getDetails()
      expect(icpswapDetails.getAbout()).toEqual(
        "The SNS&GHOST NFT Gifts for the $GHOST Community.",
      )
      const icpswapTransactions = await icpswapDetails.getTransactions(0, 10)
      expect(icpswapTransactions.activity).toHaveLength(3)
      expect(icpswapTransactions.isLastPage).toBeTruthy()
      const icpswapActivity =
        icpswapTransactions.activity[0].getTransactionView()
      expect(icpswapActivity.getType()).toEqual("Transfer")
      expect(icpswapActivity.getFormattedPrice()).toEqual(undefined)
      expect(icpswapActivity.getFormattedDate()).toEqual(
        "Jul 17, 2024 - 09:57:56 pm",
      )
      expect(icpswapActivity.getFrom()).toEqual(
        "f314402b0e472cd9fef4a533d7aab99041dbf794fee556bb5cd785ed3b1a4a99",
      )
      expect(icpswapActivity.getTo()).toEqual(
        "0051449d6ed40385865c7ddd44e1ce87a4e0c3d054bd86b936a9aedf094f62df",
      )

      const icpswapActivityMint =
        icpswapTransactions.activity[2].getTransactionView()
      expect(icpswapActivityMint.getType()).toEqual("Mint")
      expect(icpswapActivityMint.getFormattedPrice()).toEqual("0 ICP")
      expect(icpswapActivityMint.getFormattedDate()).toEqual(
        "Dec 07, 2022 - 08:53:48 am",
      )
      expect(icpswapActivityMint.getFrom()).toEqual(undefined)
      expect(icpswapActivityMint.getTo()).toEqual(
        "af8283ad383bc6e16509683b3256fdb4a5d2ece25261e8c39b1677bab7019e44",
      )

      const icpSwapWithProperties = result.items.filter(
        (nft) => nft.getCollectionId() === "p5rex-yqaaa-aaaag-qb42a-cai",
      )[0]
      const icpSwapProperties = await icpSwapWithProperties
        .getDetails()
        .then((dt) => dt.getProperties())
      expect(icpSwapProperties.mappedValues.length).toEqual(5)
      expect(icpSwapProperties.mappedValues[0].category).toEqual("Background")
      expect(icpSwapProperties.mappedValues[0].option).toEqual("Purple")
    })

    it.skip("should calculate usd price", async () => {
      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      jest
        .spyOn(exchangeRateService as any, "getICP2USD")
        .mockReturnValue(new BigNumber(8.957874722))

      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValueOnce([
          {
            ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
            name: "Internet Computer",
            symbol: "ICP",
            index: "qhbym-qaaaa-aaaaa-aaafq-cai",
            state: "Active",
            category: "Native",
            fee: BigInt(10000),
            decimals: 8,
          },
          {
            ledger: "2awyi-oyaaa-aaaaq-aaanq-cai",
            name: "A first letter",
            symbol: "A first letter",
            index: "qhbym-qaaaa-aaaaa-aaafq-cai",
            state: "Active",
            category: "Native",
            fee: BigInt(10000),
            decimals: 8,
          },
          {
            ledger: NFIDW_CANISTER_ID,
            name: "NFID Wallet",
            symbol: "NFIDW",
            index: "",
            state: "Active",
            category: "SNS",
            fee: BigInt(1000),
            decimals: 8,
          },
          {
            ledger: CKBTC_CANISTER_ID,
            name: "ckBTC",
            symbol: "ckBTC",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(1000),
            decimals: 8,
          },
        ])

      const result = await nftService.getNFTs(principal, 1, 10)
      const tokens: FT[] = await ftService.getTokens(
        "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae",
      )
      const icp = tokens.find((t) => t.getTokenAddress() === ICP_CANISTER_ID)
      await icp?.init(principal)
      const price = await nftService.getNFTsTotalPrice(result.items, icp)
      expect(price?.value).toEqual("5.91")
    })
  })

  describe("getNFTByTokenId", () => {
    it("should return the correct NFT details for a given ID", async () => {
      const nftId = "yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a"

      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      jest
        .spyOn(exchangeRateService as any, "getICP2USD")
        .mockReturnValue(new BigNumber(8.957874722))

      const nft = await nftService.getNFTByTokenId(nftId, principal, 1)

      expect(nft).toBeDefined()
      if (!nft) return

      expect(nft.getTokenNumber()).toEqual(2066)
      expect(nft.getCollectionId()).toEqual("64x4q-laaaa-aaaal-qdjca-cai")
      expect(nft.getCollectionName()).toEqual("Cellphones")
      expect(nft.getTokenName()).toEqual("Cellphones #2066")
      expect(nft.getTokenFloorPriceIcpFormatted()).toEqual("0.02 ICP")
      expect(nft.getTokenFloorPriceUSDFormatted()).toEqual("0.18 USD")
      expect(nft.getTokenId()).toEqual(nftId)
      expect(nft.getMarketPlace()).toEqual("EXT")
      expect(nft.getMillis()).toEqual(1721253726158)

      const assetPreview = nft.getAssetPreview()
      expect(assetPreview?.format).toEqual("img")
      expect(assetPreview?.url).toEqual(
        "https://images.entrepot.app/t/64x4q-laaaa-aaaal-qdjca-cai/yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )
      expect(nft.getTokenLink()).toEqual(
        "https://64x4q-laaaa-aaaal-qdjca-cai.raw.icp0.io/?tokenid=yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )

      const details = await nft.getDetails()
      expect(details.getAbout()).toEqual(
        "Cellphones on ICP ringing throughout the cryptoverse.",
      )
      const assetFullSize = await details.getAssetFullSize()
      expect(assetFullSize.format).toEqual("img")
      expect(assetFullSize.url).toEqual(
        "https://64x4q-laaaa-aaaal-qdjca-cai.raw.icp0.io/?tokenid=yfmjl-eakor-uwiaa-aaaaa-c4a2i-qaqca-aabaj-a",
      )

      const transactions = await details.getTransactions(0, 10)
      expect(transactions.activity).toHaveLength(0)
    })
  })
})
