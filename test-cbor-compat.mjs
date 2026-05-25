import { Cbor as OldCbor, Expiry as OldExpiry, requestIdOf as oldRequestIdOf } from "@dfinity/agent";
import { Principal as OldPrincipal } from "@dfinity/principal";
import { Cbor, requestIdOf, Expiry } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const borc = require("borc");

// === encodeContentMap (same as in call-canister.service.ts) ===
function bigIntToUint8Array(n) {
  let hex = n.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function encodeContentMap(contentMap) {
  const prepared = {};
  for (const [key, value] of Object.entries(contentMap)) {
    if (value === undefined) continue;
    if (value && typeof value === "object" && "_isPrincipal" in value) {
      prepared[key] = Buffer.from(value.toUint8Array());
    } else if (typeof value === "bigint" || (value && typeof value === "object" && "_isExpiry" in value)) {
      const bigVal = typeof value === "bigint" ? value : value.toBigInt();
      prepared[key] = new borc.Tagged(2, Buffer.from(bigIntToUint8Array(bigVal)));
    } else if (value instanceof Uint8Array) {
      prepared[key] = Buffer.from(value);
    } else {
      prepared[key] = value;
    }
  }
  return new Uint8Array(borc.encode(new borc.Tagged(55799, prepared)));
}

// === decodeCallRequest (same as @slide-computer/signer-agent) ===
function decodeCallRequest(contentMap) {
  const decoded = OldCbor.decode(contentMap);
  const expiry = new OldExpiry(0);
  expiry._value = BigInt(decoded.ingress_expiry.toString(10));
  return { ...decoded, canister_id: OldPrincipal.from(decoded.canister_id), ingress_expiry: expiry };
}

// === Test data ===
const canisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
const sender = Principal.fromText("jlleu-2iqae-xibmz-wak3h-bxoce-dmmwf-cbkwi-qasi5-4mdlo-wqe3e-mae");
const arg = new Uint8Array([68, 73, 68, 76, 0, 1, 104]);
const nonce = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
const ingressExpiryNs = BigInt("1748189712000000000");

const expiry = Expiry.fromDeltaInMilliseconds(300000); // 5 min

const submit = {
  request_type: "call",
  canister_id: canisterId,
  method_name: "icrc1_transfer",
  arg,
  sender,
  ingress_expiry: expiry,
  nonce,
};

console.log("=== TEST 1: encodeContentMap (borc) → decode with @dfinity/agent ===");
const borcEncoded = encodeContentMap(submit);
console.log("Encoded length:", borcEncoded.length);

try {
  const decoded = OldCbor.decode(borcEncoded);
  console.log("✅ Decoded OK:", {
    request_type: decoded.request_type,
    method_name: decoded.method_name,
    ingress_expiry_type: typeof decoded.ingress_expiry,
    ingress_expiry: decoded.ingress_expiry?.toString(),
  });
} catch (e) {
  console.log("❌ Decode FAILED:", e.message);
}

console.log("\n=== TEST 2: requestId match (borc encoded) ===");
const walletRequestId = requestIdOf(submit);
const walletHex = Buffer.from(walletRequestId).toString("hex");
console.log("Wallet requestId (@icp-sdk/core):", walletHex);

const requestBody = decodeCallRequest(borcEncoded);
const ikRequestId = oldRequestIdOf(requestBody);
const ikHex = Buffer.from(ikRequestId).toString("hex");
console.log("IdentityKit requestId (@dfinity/agent):", ikHex);
console.log("Match:", walletHex === ikHex, walletHex === ikHex ? "✅" : "❌");

console.log("\n=== TEST 3: Cbor.encode (@icp-sdk/core) → decode with @dfinity/agent ===");
const ipcEncoded = Cbor.encode(submit);
try {
  const decoded2 = OldCbor.decode(new Uint8Array(ipcEncoded));
  console.log("✅ Decoded OK:", {
    ingress_expiry_type: typeof decoded2.ingress_expiry,
    ingress_expiry: decoded2.ingress_expiry?.toString(),
  });
  const requestBody2 = decodeCallRequest(new Uint8Array(ipcEncoded));
  const ikRequestId2 = oldRequestIdOf(requestBody2);
  const ikHex2 = Buffer.from(ikRequestId2).toString("hex");
  console.log("IdentityKit requestId (from @icp-sdk Cbor.encode):", ikHex2);
  console.log("Match with wallet:", walletHex === ikHex2, walletHex === ikHex2 ? "✅" : "❌");
} catch (e) {
  console.log("❌ Decode FAILED:", e.message);
}

console.log("\n=== TEST 4: compare arg bytes ===");
const decodedArg = requestBody.arg;
console.log("Original arg type:", arg.constructor.name, "length:", arg.length);
console.log("Decoded arg type:", decodedArg?.constructor?.name, "length:", decodedArg?.byteLength);
const u1 = new Uint8Array(arg);
const u2 = new Uint8Array(decodedArg);
const argMatch = u1.length === u2.length && u1.every((v, i) => v === u2[i]);
console.log("Arg bytes match:", argMatch, argMatch ? "✅" : "❌");

console.log("\n=== TEST 5: sender principal match ===");
const decodedSender = OldPrincipal.from(requestBody.sender);
console.log("Original sender:", sender.toText());
console.log("Decoded sender:", decodedSender.toText());
console.log("Match:", sender.toText() === decodedSender.toText(), sender.toText() === decodedSender.toText() ? "✅" : "❌");
