/**
 * @jest-environment jsdom
 */
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { expect } from "@jest/globals"

import * as nfidIntegration from "@nfid/integration"

import {
  getWalletDelegation,
  getWalletPrincipal,
} from "frontend/integration/facade/wallet"

describe("wallet suite", () => {
  describe("getWalletPrincipal", () => {
    it("request ii for principal", async function () {
      const expected = Principal.anonymous()
      // @ts-ignore
      nfidIntegration.ii.get_principal = jest.fn(async () => expected)
      const response = await getWalletPrincipal(10000)
      expect(response).toBe(expected)
    })
  })

  describe("getWalletDelegation", () => {
    it("should pass correct scope", async function () {
      const delegationByScope = jest
        .spyOn(nfidIntegration.delegationState, "getDelegation")
        .mockImplementation(() => Promise.resolve({} as DelegationIdentity))

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
