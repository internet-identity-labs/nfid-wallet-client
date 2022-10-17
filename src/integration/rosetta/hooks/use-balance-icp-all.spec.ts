/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { act, renderHook, waitFor } from "@testing-library/react"

import * as imHooks from "frontend/integration/identity-manager/queries"
import * as iiHooks from "frontend/integration/internet-identity/queries"

import * as rosettaMocks from ".."
import { Account, Application } from "../../identity-manager"
import { APP_ACC_BALANCE_SHEET } from "../queries.mocks"
import { useBalanceICPAll } from "./use-balance-icp-all"

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
    const getBalanceP0 = Promise.resolve({ value: "0.1", ...commonFields })
    const getBalanceP1 = Promise.resolve({ value: "0.0", ...commonFields })
    const getBalanceP2 = Promise.resolve({ value: "0.2", ...commonFields })
    const getBalanceP3 = Promise.resolve({ value: "1.0", ...commonFields })

    const getBalanceSpy = jest
      .spyOn(rosettaMocks, "getBalance")
      .mockImplementationOnce(() => getBalanceP0)
      .mockImplementationOnce(() => getBalanceP1)
      .mockImplementationOnce(() => getBalanceP2)
      .mockImplementationOnce(() => getBalanceP3)

    const getExchangeRateP1 = Promise.resolve(5)
    const getExchangeRateSpy = jest
      .spyOn(rosettaMocks, "getExchangeRate")
      .mockImplementation(() => getExchangeRateP1)

    const useAllPrincipals = jest
      .spyOn(iiHooks, "useAllPrincipals")
      .mockImplementation(() => ({
        principals: [
          {
            principal: Principal.fromText(
              "gv5fe-6s7su-pgeqr-2wizb-t3suu-7kayl-vqxah-3yyia-ezheu-uovga-rqe",
            ),
            account: {
              domain: "domain-1",
              accountId: "0",
            } as Account,
          },
          {
            principal: Principal.fromText(
              "b27e3-f3kqs-v4awo-5naps-qdb2x-6pi6t-elxdc-snwxn-nz3jd-3445f-5qe",
            ),
            account: {
              domain: "domain-2",
              accountId: "0",
            } as Account,
          },
          {
            principal: Principal.fromText(
              "yosev-36gsi-oipnu-ayggf-4bnff-6ljlu-p3qos-xmqt7-dqmtm-i5mit-dae",
            ),
            account: {
              domain: "domain-1",
              accountId: "1",
              label: "renamedAccount",
            } as Account,
          },
          {
            // principal: Ed25519KeyIdentity.generate().getPrincipal(),
            principal: Principal.fromText(
              "dcxdv-zztqe-t22xz-k4jl6-j7vx5-3b3zh-z645u-mjlg6-lnerc-qaiq2-sae",
            ),
            account: {
              domain: "nfid.one",
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
            domain: "nfid.one",
            name: "NFID",
            isNftStorage: false,
          } as Application,
          {
            accountLimit: 1,
            domain: "domain-1",
            name: "Application 1",
            isNftStorage: false,
            icon: "https://i.picsum.photos/id/652/65/65.jpg?hmac=I1_RisYpAdE77zf_bRKKqMbTRgKaTkoOBiB0avFTMhk",
          } as Application,
          {
            accountLimit: 1,
            domain: "domain-2",
            name: "Application 2",
            isNftStorage: false,
            icon: "app-icon-2",
          } as Application,
        ],
        isLoading: false,
        refreshApplicationMeta: jest.fn(),
      }))

    const { result } = renderHook(() => useBalanceICPAll())

    await act(async () => {
      await getBalanceP1
      await getBalanceP2
      await getBalanceP3
      await getExchangeRateP1
    })

    waitFor(() => {
      expect(useAllPrincipals).toHaveBeenCalled()
      expect(getExchangeRateSpy).toHaveBeenCalled()
      expect(useApplicationsMeta).toHaveBeenCalled()
      expect(result.current.isLoading).toBe(true)
      expect(getBalanceSpy).toBeCalledTimes(3)
    })
    expect(result.current.isLoading).toBe(false)

    debugger
    expect(result.current.appAccountBalance).toEqual(APP_ACC_BALANCE_SHEET)
  })
})
