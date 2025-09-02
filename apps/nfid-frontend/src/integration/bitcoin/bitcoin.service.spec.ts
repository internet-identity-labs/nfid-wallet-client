import { SignIdentity } from "@dfinity/agent"
import {
  Ed25519KeyIdentity,
  JsonnableEd25519KeyIdentity,
} from "@dfinity/identity/lib/cjs/identity/ed25519"
import { Principal } from "@dfinity/principal"
import { SelectedUtxosFeeResponse } from "packages/integration/src/lib/_ic_api/icrc1_oracle.d"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import {
  bitcoinService,
  BlockIndex,
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "./bitcoin.service"
import { TransactionId } from "./services/chain-fusion-signer.service"
import { mempoolService } from "./services/mempool.service"

const IDENTITY: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003008adc857dfcd0477a7aaa01a657ca6923ce76c07645704b1e872deb1253baa",
  "de33b3c3ed88942af13cb4fe4384f9e9126d8af5482dbc9ccd71208f250bdaed",
]

describe("Bitcoin Service", () => {
  jest.setTimeout(50000)

  beforeEach(async () => {
    await authStorage.clear()

    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()
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
    const idbAddress = await authStorage.get(`bitcoin-address-${principal}`)

    // Then
    expect(address).toEqual("bc1q7yu8dnvmlntrqh05wvfar2tljrm73ng6ky8n4t")
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

  it("should return a balance", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)

    // When
    const balance: bigint = await bitcoinService.getBalance(identity)

    // Then
    expect(balance).toEqual(BigInt(1618))
  })

  it("should return a quick balance", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: Principal = identity.getPrincipal()

    // When
    const balance: bigint = await bitcoinService.getQuickBalance(principal)

    // Then
    expect(balance).toEqual(BigInt(1618))
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

  it("should return a BtcToCkBtc fee", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const amount: string = "0.00001"

    // When
    const fee = await bitcoinService.getBtcToCkBtcFee(identity, amount)

    // Then
    expect(fee.icpNetworkFee).toBe(BigInt(100))
    expect(fee.bitcointNetworkFee.fee_satoshis).not.toBeNull()
    expect(fee.bitcointNetworkFee.utxos).not.toHaveLength(0)
  })

  it("should return a CkBtcToBtc fee", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const amount: string = "0.00001"

    // When
    const fee = await bitcoinService.getCkBtcToBtcFee(identity, amount)

    // Then
    expect(fee.identityLabsFee).toBe(BigInt(9))
    expect(fee.bitcointNetworkFee.fee_satoshis).not.toBeNull()
    expect(fee.bitcointNetworkFee.utxos).toHaveLength(0)
  })

  it.skip("should send a token and return transaction id", async () => {
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

  it.skip("should convert ckBtc into Btc", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const amount: string = "0.0005"
    const fee: CkBtcToBtcFee = await bitcoinService.getCkBtcToBtcFee(
      identity,
      amount,
    )

    // When
    const txid: BlockIndex = await bitcoinService.convertFromCkBtc(
      identity,
      amount,
      fee,
    )

    // Then
    expect(txid).not.toBeNull()
  })

  it.skip("should send Btc into ckBtc minter", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const amount: string = "0.00001"
    const fee: BtcToCkBtcFee = await bitcoinService.getBtcToCkBtcFee(
      identity,
      amount,
    )

    // When
    const txid: TransactionId = await bitcoinService.convertToCkBtc(
      identity,
      amount,
      fee,
    )

    // Then
    expect(txid).not.toBeNull()
  })

  it("should throw an error when ensureWalletConfirmations returns false for getFee", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    await authStorage.set(key, "bc1qw9fpg8nu0qq74yqn88j5tr7yzk0jfkx6v8mh4l")

    const checkWalletConfirmationsSpy = jest
      .spyOn(mempoolService, "checkWalletConfirmations")
      .mockResolvedValue(false)

    const amount: string = "0.00001"

    // When/Then
    await expect(bitcoinService.getFee(identity, amount)).rejects.toThrow(
      "Your last BTC transaction is still going through confirmations. Once it hits all six, you will be able to send again.",
    )

    // Restore original implementation
    checkWalletConfirmationsSpy.mockRestore()
  })

  it("should throw an error when ensureWalletConfirmations returns false for getBtcToCkBtcFee", async () => {
    // Given
    const identity: SignIdentity = Ed25519KeyIdentity.fromParsedJson(IDENTITY)
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    await authStorage.set(key, "bc1qw9fpg8nu0qq74yqn88j5tr7yzk0jfkx6v8mh4l")

    const checkWalletConfirmationsSpy = jest
      .spyOn(mempoolService, "checkWalletConfirmations")
      .mockResolvedValue(false)

    const amount: string = "0.00001"

    // When/Then
    await expect(
      bitcoinService.getBtcToCkBtcFee(identity, amount),
    ).rejects.toThrow(
      "Your last BTC transaction is still going through confirmations. Once it hits all six, you will be able to send again.",
    )

    // Restore original implementation
    checkWalletConfirmationsSpy.mockRestore()
  })
})
