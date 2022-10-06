/**
 * @jest-environment jsdom
 */
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { renderHook } from "@testing-library/react"

import * as iiHooks from "frontend/integration/internet-identity/queries"

import * as rosettaMocks from "."
import { Account, Profile } from "../identity-manager"
import { useBalanceICPAll } from "./queries"

describe("rosetta queries suite", () => {
  describe("useBalanceICPAll", () => {
    it("should work", () => {
      const getBalanceSpy = jest
        .spyOn(rosettaMocks, "getBalance")
        .mockImplementation(() =>
          Promise.resolve({
            value: "0",
            currency: {
              symbol: "ICP",
              decimals: 1,
              metadata: {
                Issuer: "",
              },
            },
            metadata: {},
          }),
        )

      const useAllPrincipals = jest
        .spyOn(iiHooks, "useAllPrincipals")
        .mockImplementation(() => ({
          principals: [
            {
              principal: Ed25519KeyIdentity.generate().getPrincipal(),
              account: {
                domain: "domain-1",
                accountId: "0",
              } as Account,
            },
            {
              principal: Ed25519KeyIdentity.generate().getPrincipal(),
              account: {
                domain: "domain-1",
                accountId: "1",
              } as Account,
            },
            {
              principal: Ed25519KeyIdentity.generate().getPrincipal(),
              account: {
                domain: "domain-2",
                accountId: "0",
              } as Account,
            },
          ],
        }))
      const { result, rerender } = renderHook(() => useBalanceICPAll())
      expect(useAllPrincipals).toHaveBeenCalled()
      expect(result.current.isLoading).toBe(true)
      expect(getBalanceSpy).toBeCalledTimes(3)
    })
  })
})
