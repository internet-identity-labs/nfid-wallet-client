import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { bridgeService } from "./bridge.service"

const ADDRESS = "0xABCDEF1234567890ABCDef1234567890AbcDEF12"
const TOKEN_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"

describe("BridgeService", () => {
  jest.setTimeout(120000)

  describe("getSupportedDestinationChains", () => {
    it("should exclude source chain from results for native token", async () => {
      const result = await bridgeService.getSupportedDestinationChains(
        ChainId.ETH,
        "native",
      )
      expect(result).not.toContain(ChainId.ETH)
      expect(result.length).toBe(3)
    })

    it.skip("should return chains where ERC20 token is registered", async () => {
      const result = await bridgeService.getSupportedDestinationChains(
        ChainId.BASE,
        TOKEN_ADDRESS,
      )
      console.debug("supported chains", result)
      expect(result).toBeDefined()
    })
  })

  describe("getPendingBridges", () => {
    it("should return empty array when no ongoing operations", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ operations: [] }),
      })
      const result = await bridgeService.getPendingBridges(ADDRESS)
      expect(result).toEqual([])
    })

    it("should filter out completed operations", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          operations: [
            {
              status: "completed",
              sourceChain: { chainId: 2, transaction: { txHash: "0xabc" } },
              targetChain: { chainId: 5 },
            },
          ],
        }),
      })
      const result = await bridgeService.getPendingBridges(ADDRESS)
      expect(result).toHaveLength(0)
    })

    it.skip("should return real pending bridges from Wormhole Scan", async () => {
      const result = await bridgeService.getPendingBridges(ADDRESS)
      console.debug("pending bridges", result)
      expect(result).toBeDefined()
    })
  })

  describe("estimateBridge", () => {
    it.skip("should return source and redeem gas estimates", async () => {
      const result = await bridgeService.estimateBridge(
        ChainId.BASE,
        ChainId.POL,
        TOKEN_ADDRESS,
        "0.01",
        6,
      )
      console.debug("estimate", result)
      expect(result.sourceCost).toBeDefined()
      expect(result.redeemCost).toBeDefined()
    })
  })

  describe("bridge", () => {
    it.skip("should bridge USDC from Base to Polygon", async () => {
      const identity = {} as any // replace with real identity
      const txHashes = await bridgeService.bridge(
        identity,
        ChainId.BASE,
        ChainId.POL,
        TOKEN_ADDRESS,
        "0.01",
        6,
      )
      console.debug("bridge complete", txHashes)
      expect(txHashes).toBeDefined()
    })
  })
})
