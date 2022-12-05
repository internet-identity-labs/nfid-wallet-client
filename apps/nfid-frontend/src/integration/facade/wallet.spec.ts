/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { expect } from "@jest/globals"

import { ii } from "@nfid/integration"

import {
  getWalletDelegation,
  getWalletPrincipal,
} from "frontend/integration/facade/wallet"
import { delegationByScope } from "frontend/integration/internet-identity"

describe("wallet suite", () => {
  describe("getWalletPrincipal", () => {
    it("request ii for principal", async function () {
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
      expect(delegationByScope).toHaveBeenCalledWith(
        10000,
        "nfid.one",
        BigInt(2 * 60 * 1e9),
      )
      await getWalletDelegation(10000, "https://testScope.fk")
      expect(delegationByScope).toHaveBeenCalledWith(
        10000,
        "https://testScope.fk",
        BigInt(2 * 60 * 1e9),
      )
      await getWalletDelegation(10000, "https://testScope.fk", "1")
      expect(delegationByScope).toHaveBeenCalledWith(
        10000,
        "1@https://testScope.fk",
        BigInt(2 * 60 * 1e9),
      )
    })
  })
})
