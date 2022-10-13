/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"
import { renderHook } from "@testing-library/react"

import { Account, Application } from "frontend/integration/identity-manager"
import * as imHooks from "frontend/integration/identity-manager/queries"
import * as iiHooks from "frontend/integration/internet-identity/queries"

import { useTransactionsFilter } from "./use-transactions-filter"

describe("useTransactionsFilter", () => {
  it("should return filter options array", () => {
    const useAllPrincipals = jest
      .spyOn(iiHooks, "useAllPrincipals")
      .mockImplementation(() => ({
        principals: [
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
              "yosev-36gsi-oipnu-ayggf-4bnff-6ljlu-p3qos-xmqt7-dqmtm-i5mit-dae",
            ),
            account: {
              domain: "domain-1",
              accountId: "1",
              label: "renamedAccount",
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
    const { result } = renderHook(() => useTransactionsFilter())
    expect(useAllPrincipals).toHaveBeenCalledTimes(2)
    expect(useApplicationsMeta).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual({
      transactionsFilterOptions: [
        {
          label: "NFID account 1",
          value:
            "7d3b6612f09d9464612dae852b32b5169e4d8afb556b7921b49bd79e4b637f88",
        },
        {
          label: "Application 1 account 1",
          value:
            "d9197b5c40cfab4049cdae2dcccfa062d616a25ce85a189e4b6a8c610daa4bc0",
        },
        {
          label: "Application 1 renamedAccount",
          value:
            "27a716d1a6fad66ddf068e3605e8280b5839e7b7e159d97295f6e1840a0a0a9a",
        },
        {
          label: "Application 2 account 1",
          value:
            "bfd62f239e34e2cd42e651b1c0c1a6758a08895720ac5b4b2fd728250b939832",
        },
      ],
    })
  })
})
