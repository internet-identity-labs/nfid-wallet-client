import { SignIdentity } from "@dfinity/agent"
import {
  Ed25519KeyIdentity,
  JsonnableEd25519KeyIdentity,
} from "@dfinity/identity/lib/cjs/identity/ed25519"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { bitcoinService } from "./bitcoin.service"
import { SelectedUtxosFeeResponse } from "./idl/patron.d"
import { patronService } from "./services/patron.service"

const IDENTITY: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003008adc857dfcd0477a7aaa01a657ca6923ce76c07645704b1e872deb1253baa",
  "de33b3c3ed88942af13cb4fe4384f9e9126d8af5482dbc9ccd71208f250bdaed",
]

describe("Bitcoin Service", () => {
  jest.setTimeout(50000)

  beforeAll(async () => {
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    patronService.askToPayFor(identity)
  })

  beforeEach(async () => {
    await authStorage.clear()

    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()
    await authStorage.set("patron", "true")
    await authStorage.set(
      `bitcoin-address-${principal}`,
      "bc1q7yu8dnvmlntrqh05wvfar2tljrm73ng6ky8n4t",
    )
  })

  afterAll(async () => {
    await authStorage.clear()
  })

  it("should return an address", async () => {
    // Given
    await authStorage.clear()
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()

    // When
    const address = await bitcoinService.getAddress(identity)
    const idbPatronPays = await authStorage.get("patron")
    const idbAddress = await authStorage.get(`bitcoin-address-${principal}`)

    // Then
    expect(address).toEqual("bc1q7yu8dnvmlntrqh05wvfar2tljrm73ng6ky8n4t")
    expect(idbPatronPays).toEqual("v1")
    expect(idbAddress).toEqual("bc1q7yu8dnvmlntrqh05wvfar2tljrm73ng6ky8n4t")
  })

  it("should return different address if it's saved into idb", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    await authStorage.set(key, "address")

    // When
    const address = await bitcoinService.getAddress(identity)

    // Then
    expect(address).toEqual("address")
  })

  it.skip("should return a balance", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)

    // When
    const balance: bigint = await bitcoinService.getBalance(identity)

    // Then
    expect(balance).toEqual(BigInt(49429))
  })

  it("should return a fee", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const amount: string = "0.00001"

    // When
    const fee = await bitcoinService.getFee(identity, amount)

    // Then
    expect(fee.fee_satoshis).not.toBeNull()
    expect(fee.utxos).not.toHaveLength(0)
  })

  it.skip("should return send a token", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const amount: string = "0.00001"
    const fee: SelectedUtxosFeeResponse = await bitcoinService.getFee(
      identity,
      amount,
    )
    const destinationAddress: string =
      "bc1q07dcanhfg3fqt9j2ssx4p8z8qdwlnh422unf4w"

    // When
    const txid = await bitcoinService.send(
      identity,
      destinationAddress,
      amount,
      fee,
    )

    // Then
    expect(txid).not.toBeNull()
  })
})
