/**
 * @jest-environment jsdom
 */
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { act, renderHook, waitFor } from "@testing-library/react"

import * as imHooks from "frontend/integration/identity-manager/queries"
import * as iiHooks from "frontend/integration/internet-identity/queries"

import * as rosettaMocks from "."
import { Account, Application } from "../identity-manager"
import { sumE8sICPString, useBalanceICPAll } from "./queries"

describe("rosetta queries suite", () => {
  describe("sumE8sICPString", () => {
    it("shoudl sum e8s string values", () => {
      expect(sumE8sICPString("0.0001", "0.0002")).toBe("0.0003")
    })
  })
  describe("useBalanceICPAll", () => {
    it("should return application balances with accumulated balance greater than zero", async () => {
      const commonFields = {
        currency: {
          symbol: "ICP",
          decimals: 8,
          metadata: {
            Issuer: "",
          },
        },
        metadata: {},
      }
      const call1Promise = Promise.resolve({ value: "0.0001", ...commonFields })
      const call2Promise = Promise.resolve({ value: "0.0002", ...commonFields })
      const call3Promise = Promise.resolve({ value: "0.0000", ...commonFields })
      const getBalanceSpy = jest
        .spyOn(rosettaMocks, "getBalance")
        .mockImplementationOnce(() => call1Promise)
        .mockImplementationOnce(() => call2Promise)
        .mockImplementationOnce(() => call3Promise)

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

      const useApplicationsMeta = jest
        .spyOn(imHooks, "useApplicationsMeta")
        .mockImplementation(() => ({
          applicationsMeta: [
            {
              accountLimit: 1,
              domain: "domain-1",
              name: "Application 1",
              isNftStorage: false,
            } as Application,
            {
              accountLimit: 1,
              domain: "domain-2",
              name: "Application 2",
              isNftStorage: false,
            } as Application,
          ],
          isLoading: false,
          refreshApplicationMeta: jest.fn(),
        }))

      const { result } = renderHook(() => useBalanceICPAll())

      await act(async () => {
        await call1Promise
        await call2Promise
        await call3Promise
      })

      waitFor(() => {
        expect(useAllPrincipals).toHaveBeenCalled()
        expect(useApplicationsMeta).toHaveBeenCalled()
        expect(result.current.isLoading).toBe(true)
        expect(getBalanceSpy).toBeCalledTimes(3)
      })
      expect(result.current.isLoading).toBe(false)

      expect(result.current.appAccountBalance).toEqual({
        "Application 1": {
          totalBalance: {
            value: "0.0003",
            ...commonFields,
          },
          accounts: [
            {
              accountId: "0",
              balance: {
                value: "0.0001",
                ...commonFields,
              },
            },
            {
              accountId: "1",
              balance: {
                value: "0.0002",
                ...commonFields,
              },
            },
          ],
        },
      })
    })
  })
})
