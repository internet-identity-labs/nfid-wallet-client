/**
 * @jest-environment jsdom
 */
import {
  Application,
  HTTPAppResponse,
} from "frontend/integration/_ic_api/identity_manager.did"
import { im as imMock } from "frontend/integration/actors"
import { processApplicationOrigin } from "frontend/integration/identity-manager/index"

import { BoolHttpResponse } from "../_ic_api/verifier.did"

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

      jest
        .spyOn(imMock, "get_application")
        .mockImplementation(() =>
          Promise.resolve({ data: [application] } as HTTPAppResponse),
        )

      const update_application_alias = jest
        .spyOn(imMock, "update_application_alias")
        .mockImplementation(() =>
          Promise.resolve({ data: [true] } as BoolHttpResponse),
        )

      await processApplicationOrigin("domain", "appAliasAnother", "test")
      expect(update_application_alias).toBeCalled()
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
