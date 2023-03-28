/**
 * @jest-environment jsdom
 */
import { Principal } from "@dfinity/principal"

import { Application } from "@nfid/integration"
import { E8S, toPresentation } from "@nfid/integration/token/icp"

import { AccountBalance } from "frontend/features/fungable-token/fetch-balances"

import {
  accumulateAppAccountBalance,
  sumE8sICPString,
} from "./accumulate-app-account-balances"

describe("accumulate-app-account-balances", () => {
  describe("sumE8sICPString", () => {
    it("shoudl sum e8s string values", () => {
      expect(sumE8sICPString("0.1", "0.2")).toBe("0.3")
    })
  })
  describe("accumulateAppAccountBalance", () => {
    it("should accumulate app account balances", () => {
      const balances: AccountBalance[] = [
        {
          principal: Principal.fromText(
            "gv5fe-6s7su-pgeqr-2wizb-t3suu-7kayl-vqxah-3yyia-ezheu-uovga-rqe",
          ),
          principalId:
            "gv5fe-6s7su-pgeqr-2wizb-t3suu-7kayl-vqxah-3yyia-ezheu-uovga-rqe",
          account: { domain: "one", label: "", accountId: "0" },
          balance: { ICP: BigInt(1 * E8S) },
        },
        {
          principal: Principal.fromText(
            "b27e3-f3kqs-v4awo-5naps-qdb2x-6pi6t-elxdc-snwxn-nz3jd-3445f-5qe",
          ),
          principalId:
            "b27e3-f3kqs-v4awo-5naps-qdb2x-6pi6t-elxdc-snwxn-nz3jd-3445f-5qe",
          account: { domain: "one", label: "", accountId: "1" },
          balance: { ICP: BigInt(1 * E8S) },
        },
        {
          principal: Principal.fromText(
            "yosev-36gsi-oipnu-ayggf-4bnff-6ljlu-p3qos-xmqt7-dqmtm-i5mit-dae",
          ),
          principalId:
            "yosev-36gsi-oipnu-ayggf-4bnff-6ljlu-p3qos-xmqt7-dqmtm-i5mit-dae",
          account: { domain: "two", label: "", accountId: "0" },
          balance: { ICP: BigInt(1 * E8S) },
        },
      ]
      const applications: Application[] = [
        {
          domain: "one",
          name: "one",
        } as Application,
        {
          domain: "two",
          name: "two",
        } as Application,
      ]
      const exchangeRate: number = 5
      const label: string = "Internet Computer"
      const token: string = "ICP"

      const result = accumulateAppAccountBalance({
        toPresentation,
        balances,
        applications,
        exchangeRate,
        label,
        token,
        icon: "",
        excludeEmpty: true,
        includeEmptyApps: [],
      })
      expect(result).toEqual({
        label: "Internet Computer",
        token: "ICP",
        icon: "",
        tokenBalance: BigInt(3 * E8S),
        usdBalance: "$15.00",
        applications: {
          one: {
            appName: "one",
            tokenBalance: BigInt(2 * E8S),
            accounts: [
              {
                accountName: "account 1",
                principalId:
                  "gv5fe-6s7su-pgeqr-2wizb-t3suu-7kayl-vqxah-3yyia-ezheu-uovga-rqe",
                address:
                  "d9197b5c40cfab4049cdae2dcccfa062d616a25ce85a189e4b6a8c610daa4bc0",
                tokenBalance: BigInt(1 * E8S),
                usdBalance: "$5.00",
              },
              {
                accountName: "account 2",
                principalId:
                  "b27e3-f3kqs-v4awo-5naps-qdb2x-6pi6t-elxdc-snwxn-nz3jd-3445f-5qe",
                address:
                  "bfd62f239e34e2cd42e651b1c0c1a6758a08895720ac5b4b2fd728250b939832",
                tokenBalance: BigInt(1 * E8S),
                usdBalance: "$5.00",
              },
            ],
          },
          two: {
            appName: "two",
            tokenBalance: BigInt(1 * E8S),
            accounts: [
              {
                accountName: "account 1",
                principalId:
                  "yosev-36gsi-oipnu-ayggf-4bnff-6ljlu-p3qos-xmqt7-dqmtm-i5mit-dae",
                address:
                  "27a716d1a6fad66ddf068e3605e8280b5839e7b7e159d97295f6e1840a0a0a9a",
                tokenBalance: BigInt(1 * E8S),
                usdBalance: "$5.00",
              },
            ],
          },
        },
      })
    })
  })
})
