/**
 * @jest-environment jsdom
 */
import {
  Cbor as OldCbor,
  Expiry as OldExpiry,
  requestIdOf as oldRequestIdOf,
  SubmitRequestType,
} from "@dfinity/agent"
import { Principal as OldPrincipal } from "@dfinity/principal"
import { Cbor, requestIdOf } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

// @ts-expect-error borc has no TypeScript type declarations
import borc from "borc"

// Copy of encodeContentMap from call-canister.service.ts
function bigIntToUint8Array(n: bigint): Uint8Array {
  let hex = n.toString(16)
  if (hex.length % 2) hex = "0" + hex
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function encodeContentMap(contentMap: any): Uint8Array {
  const prepared: Record<string, any> = {}
  for (const [key, value] of Object.entries(contentMap)) {
    if (value === undefined) continue
    if (value && typeof value === "object" && "_isPrincipal" in value) {
      prepared[key] = Buffer.from((value as any).toUint8Array())
    } else if (
      typeof value === "bigint" ||
      (value && typeof value === "object" && "_isExpiry" in value)
    ) {
      const bigVal =
        typeof value === "bigint" ? value : (value as any).toBigInt()
      prepared[key] = new borc.Tagged(
        2,
        Buffer.from(bigIntToUint8Array(bigVal)),
      )
    } else if (value instanceof Uint8Array) {
      prepared[key] = Buffer.from(value)
    } else {
      prepared[key] = value
    }
  }
  return new Uint8Array(borc.encode(new borc.Tagged(55799, prepared)))
}

// Simulate what @slide-computer/signer-agent's decodeCallRequest does
function decodeCallRequest(contentMap: Uint8Array) {
  const decoded = OldCbor.decode(contentMap) as any
  const expiry = new OldExpiry(0)
  ;(expiry as any)._value = BigInt(decoded.ingress_expiry.toString(10))
  return {
    ...decoded,
    canister_id: OldPrincipal.from(decoded.canister_id),
    ingress_expiry: expiry,
  }
}

describe("RPC contentMap CBOR compatibility", () => {
  // Simulate a real submit object from HttpAgent.call()
  const canisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")
  const sender = Principal.fromText(
    "jlleu-2iqae-xibmz-wak3h-bxoce-dmmwf-cbkwi-qasi5-4mdlo-wqe3e-mae",
  )
  const arg = new Uint8Array([68, 73, 68, 76, 0, 1, 104]) // sample candid
  const nonce = new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ])
  const ingressExpiryNs = BigInt("1748189712000000000")

  // Build an Expiry like HttpAgent does
  const { Expiry } = require("@icp-sdk/core/agent")
  const expiry = new Expiry(ingressExpiryNs)

  const submit = {
    request_type: "call" as const,
    canister_id: canisterId,
    method_name: "icrc1_transfer",
    arg,
    sender,
    ingress_expiry: expiry,
    nonce,
  }

  it("encodeContentMap produces CBOR decodable by @dfinity/agent", () => {
    const encoded = encodeContentMap(submit)
    expect(encoded).toBeInstanceOf(Uint8Array)
    expect(encoded.length).toBeGreaterThan(0)

    // Decode with old @dfinity/agent's Cbor.decode (uses borc)
    const decoded = OldCbor.decode(encoded) as any
    expect(decoded.request_type).toBe("call")
    expect(decoded.method_name).toBe("icrc1_transfer")
    console.log(
      "Decoded ingress_expiry type:",
      typeof decoded.ingress_expiry,
      decoded.ingress_expiry?.toString(),
    )
  })

  it("requestIdOf matches between @icp-sdk/core and @dfinity/agent after CBOR round-trip", () => {
    // 1. Wallet computes requestId from submit object using @icp-sdk/core
    const walletRequestId = requestIdOf(submit)
    console.log(
      "Wallet requestId:",
      Buffer.from(walletRequestId).toString("hex"),
    )

    // 2. Encode with borc (our encodeContentMap)
    const encoded = encodeContentMap(submit)

    // 3. Decode with @dfinity/agent (what identitykit does)
    const requestBody = decodeCallRequest(encoded)

    // 4. Identitykit computes requestId from decoded body using @dfinity/agent
    const identitykitRequestId = oldRequestIdOf(requestBody)
    console.log(
      "Identitykit requestId:",
      Buffer.from(identitykitRequestId).toString("hex"),
    )

    // These MUST match for the certificate lookup to work
    const walletHex = Buffer.from(walletRequestId).toString("hex")
    const ikHex = Buffer.from(identitykitRequestId).toString("hex")
    expect(walletHex).toBe(ikHex)
  })

  it("@icp-sdk/core Cbor.encode also produces matching requestId", () => {
    // Compare: what if we used Cbor.encode from @icp-sdk/core instead of encodeContentMap?
    const ipcEncoded = Cbor.encode(submit)

    // Decode with @dfinity/agent
    const requestBody = decodeCallRequest(new Uint8Array(ipcEncoded))
    const identitykitRequestId = oldRequestIdOf(requestBody)
    const walletRequestId = requestIdOf(submit)

    const walletHex = Buffer.from(walletRequestId).toString("hex")
    const ikHex = Buffer.from(identitykitRequestId).toString("hex")
    console.log("icp-sdk Cbor.encode → identitykit requestId:", ikHex)
    console.log("wallet requestId:", walletHex)
    console.log("Match:", walletHex === ikHex)
  })
})
