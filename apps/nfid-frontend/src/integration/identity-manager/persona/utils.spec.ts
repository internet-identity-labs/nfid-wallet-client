/**
 * @jest-environment jsdom
 */
import {
  selectAccounts,
  getNextAccountId,
  createAccount,
  getAccountDisplayOffset,
  rmTrailingSlash,
  rmProto,
} from "./utils"

describe("persona utils test suite", () => {
  describe("rmProto", () => {
    it("should remove trailing slash from input string", () => {
      expect(rmProto("http://mydomain.com")).toBe("mydomain.com")
    })
  })
  describe("rmTrailingSlash", () => {
    it("should remove trailing slash from input string", () => {
      expect(rmTrailingSlash("http://mydomain.com/")).toBe(
        "http://mydomain.com",
      )
    })
  })
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
      const accounts = selectAccounts(personas, scope, derivationOrigin)

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

  describe("getAccountDisplayOffset", () => {
    it("should return 1 for existing accounts when first account has id 1 otherwise 0", () => {
      expect(getAccountDisplayOffset([])).toBe(1)
      expect(getAccountDisplayOffset([{ persona_id: "0" }])).toBe(1)
      expect(getAccountDisplayOffset([{ persona_id: "1" }])).toBe(0)
    })
  })
})

export {}
