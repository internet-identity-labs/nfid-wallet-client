/**
 * @jest-environment jsdom
 */
import { mapApplicationAccounts } from "."
import {
  applicationAccountDetailsNormalized,
  mockAccountApplications,
  mockApplicationsMeta,
} from "./index.mocks"

describe("Profile Applications Page suite", () => {
  describe("groupPersonasByApplications test", () => {
    it("Should return grouped array with length 2", function () {
      const groupedApplications = mapApplicationAccounts(
        mockAccountApplications,
        mockApplicationsMeta,
      )
      expect(groupedApplications).toEqual(applicationAccountDetailsNormalized)
    })
  })
})
