import { getAccounts, getNextPersonaId } from "./utils"

describe("utils test suite", () => {
  describe("getAccounts", () => {
    it("should return personas filtered by new scope and drivateOrigin canister domains", () => {
      // Example:
      // dscvr.one is hosted on canister url: https://h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app
      const originalCanisterDomain = "h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app"

      // The user has created two personas on this
      const canisterPersonas = [
        { persona_id: "1", domain: originalCanisterDomain },
        { persona_id: "2", domain: `https://${originalCanisterDomain}` },
      ]

      // The user has also personas created on other domains which should be excluded
      const excludedPersonas = [{ persona_id: "1", domain: "excluded-url.com" }]

      // Then dscvr.one implements the new derivationOrigin feature and hosts
      // the app on the new scope:
      const scope = "dscvr.one"

      // dscvr.one will send the derivationOrigin parameter within the authorize-client message
      // which will be the original canister domain
      const derivationOrigin = originalCanisterDomain

      // The list of personas we'll receive from IM will include
      // the excludedPersonas from other domains and the actuall
      // canisterPersonas
      const personas = [...excludedPersonas, ...canisterPersonas]

      // the getAccounts selector should filter the personas
      let accounts = getAccounts(personas, scope, derivationOrigin)

      // so that it only includes the canisterPersonas
      expect(accounts.length).toBe(canisterPersonas.length)

      // When the user creates new personas on the new domain:
      const newPersonas = [
        { persona_id: "3", domain: scope },
        { persona_id: "4", domain: `https://${scope}` },
      ]

      // The backend will now return all personas from before
      // and additional the personas with the new domain
      const allPersonas = [...personas, ...newPersonas]

      accounts = getAccounts(allPersonas, scope, derivationOrigin)

      // now we need to include the canisterPersonas and the newPersonas
      expect(accounts.length).toBe(canisterPersonas.length + newPersonas.length)
    })
  })
})

export {}
