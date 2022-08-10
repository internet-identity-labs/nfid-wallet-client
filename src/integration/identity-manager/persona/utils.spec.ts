/**
 * @jest-environment jsdom
 */
import {
  selectAccounts,
  getNextAccountId,
  createAccount,
  getScope,
} from "./utils"

describe("persona utils test suite", () => {
  describe("selectAccounts", () => {
    it("selects personas/accounts for given domain", () => {
      const expectedResult = [
        // NOTE: we currently have accounts, where the domain field
        // includes AND misses the protocol. Both needs to
        // be included in the filtered list
        {
          domain: "3l2cj-5aaaa-aaaag-aaecq-cai.ic0.app",
          persona_name: "Account 1",
          persona_id: "1",
        },
        {
          domain: "https://3l2cj-5aaaa-aaaag-aaecq-cai.ic0.app",
          persona_name: "Account 2",
          persona_id: "2",
        },
      ]
      const personas = [
        ...expectedResult,
        { persona_id: "2", domain: `canister-id.ic0.app` },
        { persona_id: "3", domain: `canister-id-2.ic0.app` },
        { persona_id: "4", domain: `canister-id-3.ic0.app` },
      ]
      expect(
        selectAccounts(personas, "https://3l2cj-5aaaa-aaaag-aaecq-cai.ic0.app"),
      ).toEqual(expectedResult)
      expect(
        selectAccounts(personas, "3l2cj-5aaaa-aaaag-aaecq-cai.ic0.app"),
      ).toEqual(expectedResult)
      expect(
        selectAccounts(
          personas,
          "https://3l2cj-5aaaa-aaaag-aaecq-cai.raw.ic0.app",
          "https://3l2cj-5aaaa-aaaag-aaecq-cai.ic0.app",
        ),
      ).toEqual(expectedResult)
      expect(
        selectAccounts(
          personas,
          "3l2cj-5aaaa-aaaag-aaecq-cai.raw.ic0.app",
          "3l2cj-5aaaa-aaaag-aaecq-cai.ic0.app",
        ),
      ).toEqual(expectedResult)
    })

    it("should return personas filtered by derivationOrigin if present", () => {
      // Example:
      // dscvr.one is hosted on canister url: https://h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app
      const derivationOrigin = "h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app"

      // The user has created two personas on this
      const canisterPersonas = [
        { persona_id: "1", domain: derivationOrigin },
        { persona_id: "2", domain: `https://${derivationOrigin}` },
      ]

      // The user has also personas created on other domains which should be excluded
      const excludedPersonas = [{ persona_id: "1", domain: "excluded-url.com" }]

      // Then dscvr.one implements the new derivationOrigin feature and hosts
      // the app on the new scope:
      const scope = "dscvr.one"

      // The list of personas we'll receive from IM will include
      // the excludedPersonas from other domains and the actuall
      // canisterPersonas
      const personas = [...excludedPersonas, ...canisterPersonas]

      // the selectAccounts selector should filter the personas
      let accounts = selectAccounts(personas, scope, derivationOrigin)

      // so that it only includes the canisterPersonas
      expect(accounts.length).toBe(canisterPersonas.length)
    })
  })

  describe("getNextPersonaId(filteredPersonas)", () => {
    it("should increment correctly", () => {
      const scope = "h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app"
      const accounts = [
        { persona_id: "1", domain: scope },
        { persona_id: "2", domain: `https://${scope}` },
      ]
      expect(getNextAccountId(accounts)).toBe("3")
    })
  })

  describe("getScope", () => {
    it("does not include a persona salt for the zero persona", () => {
      expect(getScope("https://test.com", "0")).toBe("https://test.com")
    })
    it("does not include a persona salt for a null persona", () => {
      expect(getScope("https://test.com")).toBe("https://test.com")
    })
    it("includes persona salt for a 1+ persona", () => {
      expect(getScope("https://test.com", "1")).toBe("1@https://test.com")
    })
    it("adds https protocol if no protocol is present", () => {
      expect(getScope("test.com", "1")).toBe("1@https://test.com")
    })
  })

  describe("createAccount", () => {
    it("exclusively uses derivationOrigin to create persona if present", () => {
      const accounts = [
        { persona_id: "1", domain: `somepage.com` },
        { persona_id: "2", domain: `somepage.com` },
        { persona_id: "2", domain: `test.com` },
        { persona_id: "1", domain: `test-canister-id.ic0.app` },
      ]
      const newAccount = createAccount(
        accounts,
        "test.com",
        "test-canister-id.ic0.app",
      )
      expect(newAccount.domain).toBe("test-canister-id.ic0.app")
      expect(newAccount.accountId).toBe("2")
    })
  })
})

export {}
