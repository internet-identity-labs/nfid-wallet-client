/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { expect } from "@jest/globals"

import { ii } from "frontend/integration/actors"
import {
  getWalletDelegation,
  getWalletPrincipal,
} from "frontend/integration/facade/wallet"
import { delegationByScope } from "frontend/integration/internet-identity"

describe("wallet suite", () => {
  describe("getWalletPrincipal", () => {
    it("should return correct exchange rate.", async function () {
      let expected = Principal.anonymous()
      // @ts-ignore
      ii.get_principal = jest.fn(async () => expected)
      let response = await getWalletPrincipal(10000)
      expect(response).toBe(expected)
    })
  })

  describe("getWalletDelegation", () => {
    it("should pass correct scope", async function () {
      // @ts-ignore
      delegationByScope = jest.fn()
      await getWalletDelegation(10000)
      // @ts-ignore
      let call = delegationByScope.mock.calls[0]
      expect(call[1]).toBe("nfid.one")
      expect(call[0]).toBe(10000)
      expect(call[3]).toBe(BigInt(2 * 60 * 1e9))
      await getWalletDelegation(10000, "https://testScope.fk")
      // @ts-ignore
      call = delegationByScope.mock.calls[1]
      expect(call[1]).toBe("https://testScope.fk")
      await getWalletDelegation(10000, "https://testScope.fk", "1")
      // @ts-ignore
      call = delegationByScope.mock.calls[2]
      expect(call[1]).toBe("1@https://testScope.fk")
    })
  })
})
