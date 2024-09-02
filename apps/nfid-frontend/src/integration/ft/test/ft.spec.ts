import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"
import { ftService } from "src/integration/ft/ft-service"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { mockGeekResponse } from "src/integration/nft/mock/mock"

import { exchangeRateService } from "@nfid/integration"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

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
        ])
      const result: PaginatedResponse<FT> = await ftService.getAllUserTokens(
        userId,
        principal,
      )
      expect(result.items.length).toEqual(2)
      const icpResult = result.items.find(
        (r) => r.getTokenName() === "Internet Computer",
      )
      expect(icpResult).toBeDefined()
      expect(icpResult!.getTokenBalanceFormatted()).toEqual("0.0002 ICP")
      expect(icpResult!.getTokenCategory()).toEqual("Native")
      expect(icpResult!.getTokenFeeRaw()).toEqual(BigInt(10000))
      expect(icpResult!.getTokenDecimals()).toEqual(8)
      expect(icpResult!.getTokenAddress()).toEqual(
        "ryjl3-tyaaa-aaaaa-aaaba-cai",
      )
      expect(icpResult!.getBlockExplorerLink()).toEqual(
        "https://dashboard.internetcomputer.org/canister/ryjl3-tyaaa-aaaaa-aaaba-cai",
      )
      expect(await icpResult!.getUSDBalanceFormatted()).toEqual("0.00 USD")

      const filteredResult = await ftService.getAllFTokens(userId, "Chat")
      expect(filteredResult.length).toEqual(1)
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
        ])

      jest
        .spyOn(icrc1StorageService as any, "getICRC1Canisters")
        .mockResolvedValue([
          {
            owner: principal,
            balance: BigInt(200000000),
            canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
            decimals: 8,
            fee: BigInt(10000),
            name: "Internet Computer",
            symbol: "ICP",
          },
        ])
      const balance = await ftService.getTotalUSDBalance(userId, principal)
      console.log(balance)
      expect(balance).not.toEqual("0.00 USD")
    })
  })
})
