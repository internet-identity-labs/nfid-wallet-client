import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"
import { ftService } from "src/integration/ft/ft-service"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { mockGeekResponse } from "src/integration/nft/mock/mock"

import { exchangeRateService } from "@nfid/integration"
import {
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

import { nftService } from "frontend/integration/nft/nft-service"
import { portfolioService } from "frontend/integration/portfolio-balance/portfolio-service"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

const userId = "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae"
const principal = Principal.fromText(userId)

describe("ft test suite", () => {
  jest.setTimeout(35000)

  describe("ft", () => {
    it("should return", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
          {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            name: "Chat",
            symbol: "CHAT",
            logo: "Some logo",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
            state: "Active",
            category: "Unknown",
            fee: BigInt(10000),
            decimals: 8,
          },
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      const result: FT[] = await ftService.getTokens(userId)

      expect(result.length).toEqual(8)
      const icpResult = result.find(
        (r) => r.getTokenName() === "Internet Computer",
      )
      await icpResult?.init(principal)
      expect(icpResult).toBeDefined()
      expect(icpResult!.getTokenBalanceFormatted()).toEqual("0.0002")
      expect(icpResult!.getTokenCategory()).toEqual("Native")
      expect(icpResult!.getTokenFee()).toEqual(BigInt(10000))
      expect(icpResult!.getTokenDecimals()).toEqual(8)
      expect(icpResult!.getTokenAddress()).toEqual(
        "ryjl3-tyaaa-aaaaa-aaaba-cai",
      )
      expect(icpResult!.getBlockExplorerLink()).toEqual(
        "https://dashboard.internetcomputer.org/canister/ryjl3-tyaaa-aaaaa-aaaba-cai",
      )
      expect(icpResult!.getUSDBalanceFormatted()).toEqual("0.00 USD")

      const filteredResult = ftService.filterTokens(result, "CHAT")
      expect(filteredResult.length).toEqual(1)

      expect(result[0].getTokenName()).toEqual("Internet Computer")
      expect(result[1].getTokenName()).toEqual("Bitcoin")
      expect(result[2].getTokenName()).toEqual("Ethereum")
      expect(result[3].getTokenName()).toEqual("NFID Wallet")
      expect(result[4].getTokenName()).toEqual("ckBTC")
      expect(result[5].getTokenName()).toEqual("ckETH")
      expect(result[6].getTokenName()).toEqual("A first letter")
      expect(result[7].getTokenName()).toEqual("Chat")
    })

    it("should calculate no usd balance change", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])
      jest
        .spyOn(exchangeRateService as any, "usdPriceForICRC1")
        .mockResolvedValue({
          value: BigNumber(0.1),
          dayChangePercent: "0",
          dayChangePercentPositive: true,
        })
      const result: FT[] = await ftService.getTokens(userId)
      const icpResult = result.find(
        (r) => r.getTokenName() === "Internet Computer",
      )
      await icpResult?.init(principal)
      expect(icpResult!.getUSDBalanceDayChange()).toEqual(BigNumber(0))
      expect(icpResult!.getTokenRateDayChangePercent()).toEqual({
        value: "0",
        positive: true,
      })
    })

    it("should calculate positive usd balance change", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])
      jest
        .spyOn(exchangeRateService as any, "usdPriceForICRC1")
        .mockResolvedValue({
          value: BigNumber(0.1),
          dayChangePercent: "1",
          dayChangePercentPositive: true,
        })
      const result: FT[] = await ftService.getTokens(userId)
      const icpResult = result.find(
        (r) => r.getTokenName() === "Internet Computer",
      )
      await icpResult?.init(principal)
      expect(icpResult!.getUSDBalanceDayChange()).toEqual(
        BigNumber(0.0002).multipliedBy(0.1).multipliedBy(0.01),
      )
      expect(icpResult!.getTokenRateDayChangePercent()).toEqual({
        value: "1",
        positive: true,
      })
    })

    it("should calculate usd balance change when price changes data could not be loaded", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])
      const [result]: FT[] = await ftService.getTokens(userId)
      jest
        .spyOn(result, "getTokenRateDayChangePercent")
        .mockReturnValue(undefined)
      await result?.init(principal)
      expect(result!.getUSDBalanceDayChange()).toEqual(BigNumber(0))
    })

    it("should calculate negative usd balance change", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])
      jest
        .spyOn(exchangeRateService as any, "usdPriceForICRC1")
        .mockResolvedValue({
          value: BigNumber(0.1),
          dayChangePercent: "1",
          dayChangePercentPositive: false,
        })
      const result: FT[] = await ftService.getTokens(userId)
      const icpResult = result.find(
        (r) => r.getTokenName() === "Internet Computer",
      )
      await icpResult?.init(principal)
      expect(icpResult!.getUSDBalanceDayChange()).toEqual(
        BigNumber(0.0002).multipliedBy(0.1).multipliedBy(-0.01),
      )
      expect(icpResult!.getTokenRateDayChangePercent()).toEqual({
        value: "1",
        positive: false,
      })
    })

    it("shoult get all sorted tokens", async function () {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
          {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            name: "Chat",
            symbol: "CHAT",
            logo: "Some logo",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
            state: "Active",
            category: "Sns",
            fee: BigInt(10000),
            decimals: 8,
          },
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
            name: "Internet",
            symbol: "A first letter",
            index: "qhbym-qaaaa-aaaaa-aaafq-cai",
            state: "Active",
            category: "Spam",
            fee: BigInt(10000),
            decimals: 8,
          },
          {
            ledger: NFIDW_CANISTER_ID,
            name: "NFID Wallet",
            symbol: "NFIDW",
            index: "",
            state: "Active",
            category: "Community",
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      const result: FT[] = await ftService.getTokens(userId)

      expect(result.length).toEqual(8)
      expect(result[0].getTokenCategory()).toEqual(Category.Native)
      expect(result[1].getTokenCategory()).toEqual(Category.Native)
      expect(result[2].getTokenCategory()).toEqual(Category.Native)
      expect(result[3].getTokenCategory()).toEqual(Category.Community)
      expect(result[4].getTokenCategory()).toEqual(Category.ChainFusion)
      expect(result[5].getTokenCategory()).toEqual(Category.ChainFusion)
      expect(result[6].getTokenCategory()).toEqual(Category.Sns)
      expect(result[7].getTokenCategory()).toEqual(Category.Spam)
    })

    it("should calculate USD balance", async function () {
      jest
        .spyOn(nftGeekService as any, "fetchNftGeekData")
        .mockResolvedValue(mockGeekResponse)
      jest
        .spyOn(exchangeRateService as any, "getICP2USD")
        .mockReturnValue(new BigNumber(8.957874722))
      jest
        .spyOn(icrc1StorageService as any, "getICRC1ActiveCanisters")
        .mockResolvedValue([
          {
            ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
            name: "Internet Computer",
            symbol: "ICP",
            index: "qhbym-qaaaa-aaaaa-aaafq-cai",
            state: "Active",
            category: "Native",
          },
          {
            ledger: NFIDW_CANISTER_ID,
            name: "NFID Wallet",
            symbol: "NFIDW",
            index: "mgfru-oqaaa-aaaaq-aaelq-cai",
            state: "Active",
            category: "SNS",
          },
        ])

      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
          {
            name: "Internet Computer",
            ledger: "ryjl3-tyaaa-aaaaa-aaaba-cai",
            category: "Native",
            index: "qhbym-qaaaa-aaaaa-aaafq-cai",
            symbol: "ICP",
            state: "Active",
            decimals: 8,
          },
          {
            ledger: NFIDW_CANISTER_ID,
            name: "NFID Wallet",
            symbol: "NFIDW",
            index: "mgfru-oqaaa-aaaaq-aaelq-cai",
            state: "Active",
            category: "SNS",
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      // Mock getWalletDelegation to return a resolved promise
      jest
        .spyOn(
          require("frontend/integration/facade/wallet"),
          "getWalletDelegation",
        )
        .mockResolvedValue({
          getPrincipal: () => principal,
          sign: jest.fn(),
        } as any)

      const nfts = await nftService.getNFTs(principal, 1, 10)
      const result: FT[] = await ftService.getTokens(userId)

      //const stakes = stakingService.getStakedTokens()

      const balance = await portfolioService.getPortfolioUSDBalance(
        nfts.items,
        result,
      )
      expect(balance).not.toEqual("0.00 USD")
    })

    it("should filter and return only 1 not active with non zero balance token with alredy defined balance", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValueOnce([
          {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            name: "Chat",
            symbol: "CHAT",
            logo: "Some logo",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
            state: "Active",
            category: "Unknown",
            fee: BigInt(10000),
            decimals: 8,
          },
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
            state: "Inactive",
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      const result: FT[] = await ftService.getTokens(userId)
      let filteredTokens = await ftService.filterNotActiveNotZeroBalancesTokens(
        result,
        principal,
      )
      expect(filteredTokens.length).toEqual(1)
    })

    it("should not filter any not active with non zero balance token", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValueOnce([
          {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            name: "Chat",
            symbol: "CHAT",
            logo: "Some logo",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
            state: "Active",
            category: "Unknown",
            fee: BigInt(10000),
            decimals: 8,
          },
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      const result: FT[] = await ftService.getTokens(userId)
      let filteredTokens = await ftService.filterNotActiveNotZeroBalancesTokens(
        result,
        principal,
      )
      expect(filteredTokens.length).toEqual(0)
    })

    it("should filter and return only 1 not active with non zero balance token without alredy defined balance", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValueOnce([
          {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            name: "Chat",
            symbol: "CHAT",
            logo: "Some logo",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
            state: "Active",
            category: "Unknown",
            fee: BigInt(10000),
            decimals: 8,
          },
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
            state: "Inactive",
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      const result: FT[] = await ftService.getTokens(userId)
      jest.spyOn(result[3], "getTokenBalance").mockReturnValue(undefined)
      let filteredTokens = await ftService.filterNotActiveNotZeroBalancesTokens(
        result,
        principal,
      )
      expect(filteredTokens.length).toEqual(1)
    })

    it("should highlight the available tokens to swap", async () => {
      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValueOnce([
          {
            ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
            name: "Chat",
            symbol: "CHAT",
            logo: "Some logo",
            index: "2awyi-oyaaa-aaaaq-aaanq-cai",
            state: "Active",
            category: "Unknown",
            fee: BigInt(10000),
            decimals: 8,
          },
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
            state: "Inactive",
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
          {
            ledger: CKETH_LEDGER_CANISTER_ID,
            name: "ckETH",
            symbol: "ckETH",
            index: "",
            state: "Active",
            category: "ChainFusion",
            fee: BigInt(2000000000000),
            decimals: 18,
          },
        ])

      const tokens: FT[] = await ftService.getTokens(userId)

      const validTokenLedgers = new Set(
        tokens.map((token) => token.getTokenAddress()),
      )

      const [toList, fromList] = await Promise.all([
        ftService.getTokensAvailableToSwap("ryjl3-tyaaa-aaaaa-aaaba-cai"),
        ftService.getTokensAvailableToSwap(NFIDW_CANISTER_ID),
      ])

      const expectedResult = {
        to: [
          "2ouva-viaaa-aaaaq-aaamq-cai",
          CKETH_LEDGER_CANISTER_ID,
          CKBTC_CANISTER_ID,
          "ryjl3-tyaaa-aaaaa-aaaba-cai",
          NFIDW_CANISTER_ID,
        ],
        from: ["ryjl3-tyaaa-aaaaa-aaaba-cai"],
      }

      expect({
        to: toList.filter((ledger) => validTokenLedgers.has(ledger)),
        from: fromList.filter((ledger) => validTokenLedgers.has(ledger)),
      }).toEqual(expectedResult)
    })
  })
})
