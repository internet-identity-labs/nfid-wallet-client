/**
 * Test: make a real IC call and verify the certificate can be validated
 * by both @icp-sdk/core and @dfinity/agent (identitykit's lib)
 */
import { HttpAgent, Cbor, requestIdOf, Expiry } from "@icp-sdk/core/agent"
import { Ed25519KeyIdentity } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"
import { IDL } from "@icp-sdk/core/candid"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const borc = require("borc")

// ============= encodeContentMap (same as wallet) =============
function bigIntToUint8Array(n) {
  let hex = n.toString(16)
  if (hex.length % 2) hex = "0" + hex
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

function encodeContentMap(contentMap) {
  const prepared = {}
  for (const [key, value] of Object.entries(contentMap)) {
    if (value === undefined) continue
    if (value && typeof value === "object" && "_isPrincipal" in value) {
      prepared[key] = Buffer.from(value.toUint8Array())
    } else if (
      typeof value === "bigint" ||
      (value && typeof value === "object" && "_isExpiry" in value)
    ) {
      const bigVal = typeof value === "bigint" ? value : value.toBigInt()
      prepared[key] = new borc.Tagged(2, Buffer.from(bigIntToUint8Array(bigVal)))
    } else if (value instanceof Uint8Array) {
      prepared[key] = Buffer.from(value)
    } else {
      prepared[key] = value
    }
  }
  return new Uint8Array(borc.encode(new borc.Tagged(55799, prepared)))
}

// ============= Main test =============
async function main() {
  console.log("=== Making real IC call ===\n")

  // Create a temporary identity
  const identity = Ed25519KeyIdentity.generate()
  const agent = HttpAgent.createSync({ host: "https://ic0.app", identity })

  // Call a simple query-like update to get a real certificate
  // We'll call the ICP ledger's icrc1_name (but as update it will fail gracefully)
  // Better: call management canister's raw_rand or a test canister

  // Actually, let's just call any canister with an update that will get a response
  const ledgerCanisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")

  // Encode icrc1_balance_of with anonymous account
  const arg = IDL.encode(
    [IDL.Record({ owner: IDL.Principal, subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)) })],
    [{ owner: identity.getPrincipal(), subaccount: [] }]
  )

  console.log("Identity principal:", identity.getPrincipal().toText())
  console.log("Calling icrc1_balance_of on ICP ledger...\n")

  try {
    const { requestId, response, requestDetails } = await agent.call(
      ledgerCanisterId,
      {
        methodName: "icrc1_balance_of",
        arg: new Uint8Array(arg),
        effectiveCanisterId: ledgerCanisterId,
      }
    )

    console.log("Call response status:", response.status)
    console.log("requestDetails keys:", Object.keys(requestDetails))
    console.log("requestDetails.request_type:", requestDetails.request_type)
    console.log("requestDetails.sender type:", requestDetails.sender?.constructor?.name)
    console.log("requestDetails.ingress_expiry type:", requestDetails.ingress_expiry?.constructor?.name)
    console.log("requestDetails.ingress_expiry._isExpiry:", requestDetails.ingress_expiry?._isExpiry)

    // Get raw certificate from v4 response
    let rawCertificate
    if (response.body?.certificate) {
      const { uint8FromBufLike } = await import("@icp-sdk/core/candid")
      rawCertificate = uint8FromBufLike(response.body.certificate)
      console.log("\nRaw certificate length:", rawCertificate.length)
    } else {
      console.log("\nNo v4 certificate in response, status:", response.status)
      console.log("Response body keys:", response.body ? Object.keys(response.body) : "null")
      // For 202 responses, we'd need to poll. Skip for now.
      return
    }

    // ============= Wallet side: encode contentMap =============
    console.log("\n=== Wallet: encode contentMap ===")
    const cborContentMap = encodeContentMap(requestDetails)
    const contentMapB64 = Buffer.from(cborContentMap).toString("base64")
    const certificateB64 = Buffer.from(rawCertificate).toString("base64")
    console.log("contentMap base64 length:", contentMapB64.length)
    console.log("certificate base64 length:", certificateB64.length)

    // ============= Identitykit side: validate =============
    console.log("\n=== Identitykit: validate response ===")

    // Import @dfinity/agent from identitykit
    const oldAgent = require("/Users/oleksis/IdeaProjects/identitykit-debug/node_modules/@dfinity/agent")
    const oldPrincipal = require("/Users/oleksis/IdeaProjects/identitykit-debug/node_modules/@dfinity/principal")

    // 1. Decode contentMap
    const fromBase64 = (b64) => Buffer.from(b64, "base64")
    const contentMapBytes = fromBase64(contentMapB64)
    const certificateBytes = fromBase64(certificateB64)

    const decoded = oldAgent.Cbor.decode(contentMapBytes)
    const expiry = new oldAgent.Expiry(0)
    expiry._value = BigInt(decoded.ingress_expiry.toString(10))
    const requestBody = {
      ...decoded,
      canister_id: oldPrincipal.Principal.from(decoded.canister_id),
      ingress_expiry: expiry,
    }
    console.log("Decoded request_type:", requestBody.request_type)
    console.log("Decoded method_name:", requestBody.method_name)

    // 2. Content map checks
    const check1 = oldAgent.SubmitRequestType.Call === requestBody.request_type
    const check2 = oldPrincipal.Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai").compareTo(requestBody.canister_id) === "eq"
    const check3 = "icrc1_balance_of" === requestBody.method_name
    const check4 = oldAgent.compare(new Uint8Array(arg), requestBody.arg) === 0
    const senderPrincipal = oldPrincipal.Principal.from(requestBody.sender)
    const check5 = identity.getPrincipal().toText() === senderPrincipal.toText()
    console.log("\nContent map checks:", { check1, check2, check3, check4, check5 })

    if (!check1 || !check2 || !check3 || !check4 || !check5) {
      console.log("❌ Content map validation FAILED")
      if (!check5) {
        console.log("  sender mismatch:", identity.getPrincipal().toText(), "vs", senderPrincipal.toText())
      }
      return
    }
    console.log("✅ Content map validation passed")

    // 3. Compute requestId
    const ikRequestId = oldAgent.requestIdOf(requestBody)
    const walletRequestId = requestIdOf(requestDetails)
    console.log("\nWallet requestId:", Buffer.from(walletRequestId).toString("hex"))
    console.log("IK requestId:    ", Buffer.from(ikRequestId).toString("hex"))
    console.log("Match:", Buffer.from(walletRequestId).toString("hex") === Buffer.from(ikRequestId).toString("hex") ? "✅" : "❌")

    // 4. Certificate.create
    console.log("\n=== Certificate validation ===")
    const IC_ROOT_KEY = oldAgent.IC_ROOT_KEY
    const rootKey = new Uint8Array(IC_ROOT_KEY.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer

    try {
      const certificate = await oldAgent.Certificate.create({
        certificate: certificateBytes.buffer,
        rootKey,
        canisterId: oldPrincipal.Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
        maxAgeInMinutes: 5,
      })
      console.log("✅ Certificate.create succeeded")

      // 5. Lookup
      const lookupResult = certificate.lookup(["request_status", ikRequestId, "status"])
      console.log("Lookup status:", lookupResult.status)
      if (lookupResult.status === "found") {
        console.log("✅ Certificate lookup found status:", new TextDecoder().decode(lookupResult.value))
      } else {
        console.log("❌ Certificate lookup FAILED:", lookupResult.status)
      }
    } catch (certError) {
      console.log("❌ Certificate.create FAILED:", certError.message)
    }

  } catch (err) {
    console.error("Call failed:", err.message)
  }
}

main().catch(console.error)
