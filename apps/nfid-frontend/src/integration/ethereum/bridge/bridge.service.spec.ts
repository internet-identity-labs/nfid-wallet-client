import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { ETH_NATIVE_ID, EVM_NATIVE } from "@nfid/integration/token/constants"

jest.mock("frontend/integration/ethereum/eth/ethereum.service", () => ({
  ethereumService: {
    getAddress: jest
      .fn()
      .mockResolvedValue("0xA321565b10a62eEc0577be9f91827a93bb4a7a62"),
    getQuickAddress: jest
      .fn()
      .mockResolvedValue("0xA321565b10a62eEc0577be9f91827a93bb4a7a62"),
  },
}))

jest.mock(
  "frontend/integration/bitcoin/services/chain-fusion-signer.service",
  () => ({
    chainFusionSignerService: {
      ethSignTransaction: jest.fn().mockResolvedValue("0xsignedtx"),
      getEthAddress: jest
        .fn()
        .mockResolvedValue("0xA321565b10a62eEc0577be9f91827a93bb4a7a62"),
    },
  }),
)

jest.mock("frontend/integration/bitcoin/services/patron.service", () => ({
  patronService: { askToPayFor: jest.fn().mockResolvedValue(undefined) },
}))

import { bridgeService } from "./bridge.service"

const ZRO_BASE = "0x6985884C4392D348587B19cb9eAAf157F13271cd"
const USDC_BASE = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"

describe("Bridge2Service", () => {
  jest.setTimeout(120000)

  describe("getQuote", () => {
    it.skip("should return fee breakdown for native ETH bridge", async () => {
      const result = await bridgeService.getQuote(
        ChainId.ETH,
        ChainId.ARB,
        ETH_NATIVE_ID,
        EVM_NATIVE,
        "0.01",
        18,
      )
      console.debug("ETH quote", result)
      expect(result.sourceCost).toBeDefined()
      expect(result.redeemCost).toBeDefined()
      expect(result.totalUsdCost).toBeDefined()
    })

    it.skip("should return fee breakdown for ERC-20 bridge", async () => {
      const result = await bridgeService.getQuote(
        ChainId.BASE,
        ChainId.POL,
        ZRO_BASE,
        "0x0000000000000000000000000000000000000000",
        "0.014",
        18,
      )
      console.debug("ZRO quote", result)
      expect(result.sourceCost).toBeDefined()
      expect(result.redeemCost).toBeDefined()
      expect(result.totalUsdCost).toBeDefined()
    })
  })

  describe("getSupportedSourceTokens", () => {
    it("should return undefined when tokens are undefined", async () => {
      const result = await bridgeService.getSupportedSourceTokens(undefined)
      expect(result).toBeUndefined()
    })

    it("should return empty array for empty token list", async () => {
      const result = await bridgeService.getSupportedSourceTokens([])
      expect(result).toEqual([])
    })

    it("should filter out testnet and non-bridgeable tokens", async () => {
      const mockGetTokens = jest.fn().mockResolvedValue({
        tokens: {
          [ChainId.ETH]: [{ address: "0xabc000", symbol: "USDC" }],
          [ChainId.BASE]: [],
        },
      })
      jest.mock("@lifi/sdk", () => ({
        ...jest.requireActual("@lifi/sdk"),
        getTokens: mockGetTokens,
      }))

      const mockFT = (chainId: ChainId, address: string) =>
        ({
          getChainId: () => chainId,
          getTokenAddress: () => address,
          getTokenSymbol: () => "TOKEN",
        }) as any

      const tokens = [
        mockFT(ChainId.ETH, "0xabc000"),
        mockFT(ChainId.ETH, "0xnotlisted"),
        mockFT(ChainId.ETH_SEPOLIA, EVM_NATIVE),
        mockFT(ChainId.ETH, ETH_NATIVE_ID),
      ]

      ;(bridgeService as any).supportedTokensCache = new Set([
        `${ChainId.ETH}:0xabc000`,
      ])
      ;(bridgeService as any).client = {}

      const result = await bridgeService.getSupportedSourceTokens(tokens)
      expect(result?.map((t) => t.getTokenAddress())).toEqual([
        "0xabc000",
        ETH_NATIVE_ID,
      ])
    })
  })

  describe("getSupportedTargetTokens", () => {
    it("should return empty array when tokens are undefined", () => {
      const result = bridgeService.getSupportedTargetTokens(
        undefined,
        undefined,
      )
      expect(result).toEqual([])
    })

    it("should return empty array when fromToken is undefined", () => {
      const result = bridgeService.getSupportedTargetTokens([], undefined)
      expect(result).toEqual([])
    })

    it("should return empty array for testnet fromToken", () => {
      const mockFromToken = {
        getChainId: () => ChainId.ETH_SEPOLIA,
        getTokenAddress: () => EVM_NATIVE,
      } as any
      const result = bridgeService.getSupportedTargetTokens([], mockFromToken)
      expect(result).toEqual([])
    })
  })

  describe("bridge", () => {
    it("should throw when called without a pending quote", async () => {
      await expect(bridgeService.bridge()).rejects.toThrow(
        "No pending quote. Call getQuote first.",
      )
    })

    it.skip("should bridge ETH from Base to Arbitrum", async () => {
      const identity = {} as any // replace with real identity
      await bridgeService.init(identity)
      await bridgeService.getQuote(
        ChainId.BASE,
        ChainId.ARB,
        EVM_NATIVE,
        EVM_NATIVE,
        "0.001",
        18,
      )
      const txHash = await bridgeService.bridge()
      console.debug("bridge tx hash", txHash)
      expect(txHash).toBeDefined()
      expect(txHash).toMatch(/^0x/)
    })

    it.skip("should bridge ZRO from Base to Arbitrum with approval", async () => {
      const identity = {} as any // replace with real identity
      await bridgeService.init(identity)
      await bridgeService.getQuote(
        ChainId.BASE,
        ChainId.ARB,
        ZRO_BASE,
        "0x0000000000000000000000000000000000000000",
        "0.014",
        18,
      )
      const txHash = await bridgeService.bridge()
      console.debug("ZRO bridge tx hash", txHash)
      expect(txHash).toBeDefined()
    })

    it.skip("should bridge USDC from Base to Polygon", async () => {
      const identity = {} as any // replace with real identity
      await bridgeService.init(identity)
      await bridgeService.getQuote(
        ChainId.BASE,
        ChainId.POL,
        USDC_BASE,
        "0x0000000000000000000000000000000000000000",
        "1",
        6,
      )
      const txHash = await bridgeService.bridge()
      console.debug("USDC bridge tx hash", txHash)
      expect(txHash).toBeDefined()
    })
  })
})
