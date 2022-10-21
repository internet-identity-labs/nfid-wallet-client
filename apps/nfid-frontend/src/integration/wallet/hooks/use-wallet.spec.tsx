/**
 * @jest-environment jsdom
 */
import { useWallet } from "./use-wallet"

describe("use-wallet", () => {
  it("should exist", () => {
    expect(useWallet).toBeDefined()
  })
})
