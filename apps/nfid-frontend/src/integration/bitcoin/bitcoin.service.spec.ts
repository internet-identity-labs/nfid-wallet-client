import { SignIdentity } from "@dfinity/agent"
import {
  Ed25519KeyIdentity,
  JsonnableEd25519KeyIdentity,
} from "@dfinity/identity/lib/cjs/identity/ed25519"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { bitcoinService } from "./bitcoin.service"

const IDENTITY: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003008adc857dfcd0477a7aaa01a657ca6923ce76c07645704b1e872deb1253baa",
  "de33b3c3ed88942af13cb4fe4384f9e9126d8af5482dbc9ccd71208f250bdaed",
]

describe("Bitcoin Service", () => {
  jest.setTimeout(50000)

  it("should return an address", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)

    // When
    const address = await bitcoinService.getAddress(identity)

    // Then
    expect(address).toEqual("bc1q7yu8dnvmlntrqh05wvfar2tljrm73ng6ky8n4t")
  })

  it("should return different address if it's saved into idb", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    authStorage.set(key, "address")

    // When
    const address = await bitcoinService.getAddress(identity)

    // Then
    expect(address).toEqual("address")

    // Clean
    authStorage.remove(key)
  })
})
