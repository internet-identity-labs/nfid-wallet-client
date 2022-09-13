/**
 * @jest-environment jsdom
 */
import { groupPersonasByApplications } from "."
import { mockAccountApplications, mockApplicationsMeta } from "./index.mock"

describe("Profile Applications Page suite", () => {
  describe("groupPersonasByApplications test", () => {
    it("Should return grouped array with length 2", function () {
      const groupedApplications = groupPersonasByApplications(
        mockAccountApplications,
        mockApplicationsMeta,
      )
      expect(groupedApplications.length).toBe(2)
    })
    it("Should return applicationName NFID-Demo", function () {
      const groupedApplications = groupPersonasByApplications(
        mockAccountApplications,
        mockApplicationsMeta,
      )
      expect(groupedApplications[0].applicationName).toBe("NFID-Demo")
    })
    it("Should return correct length of personas", function () {
      const groupedApplications = groupPersonasByApplications(
        mockAccountApplications,
        mockApplicationsMeta,
      )
      expect(groupedApplications[0].accountsCount).toBe(3)
    })
  })
})
