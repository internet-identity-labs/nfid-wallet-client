/**
 * @jest-environment jsdom
 */
import { im as imMock } from "@nfid/integration"

import { Application } from "frontend/integration/_ic_api/identity_manager.d"
import { processApplicationOrigin } from "frontend/integration/identity-manager/index"

describe("Identity Manager suite", () => {
  jest.setTimeout(80000)

  describe("Identity Manager Service Test", () => {
    it("Should create application", async function () {
      // @ts-ignore
      imMock.get_application = jest.fn(() => Promise.resolve({ data: [] }))
      // @ts-ignore
      imMock.update_application_alias = jest.fn(() =>
        Promise.resolve({ data: [true] }),
      )
      await processApplicationOrigin("domain", "appName")
      expect(imMock.update_application_alias).toBeCalled()
    })
    it("Should update origin", async function () {
      const application: Application = {
        is_nft_storage: [],
        alias: [["appAlias"]],
        user_limit: 5,
        domain: "domain",
        name: "appName",
        img: [],
      }
      // @ts-ignore
      imMock.get_application = jest.fn(() =>
        Promise.resolve({ data: [application] }),
      )
      // @ts-ignore
      imMock.update_application_alias = jest.fn(() =>
        Promise.resolve({ data: [true] }),
      )
      await processApplicationOrigin("domain", "appAliasAnother", "test")
      expect(imMock.update_application_alias).toBeCalled()
    })
    it("Should skip", async function () {
      const application: Application = {
        is_nft_storage: [],
        alias: [["appAlias"]],
        user_limit: 5,
        domain: "domain",
        name: "appName",
        img: [],
      }
      // @ts-ignore
      imMock.get_application = jest.fn(() =>
        Promise.resolve({ data: [application] }),
      )
      // @ts-ignore
      imMock.update_application_alias = jest.fn(() =>
        Promise.resolve({ data: [true] }),
      )
      await processApplicationOrigin("domain", "appAlias")
      expect(imMock.update_application_alias).toBeCalledTimes(0)
    })
  })
})
