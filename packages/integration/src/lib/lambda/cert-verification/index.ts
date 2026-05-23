import { Cbor, Certificate, HashTree, reconstruct } from "@icp-sdk/core/agent"
import { PipeArrayBuffer, lebDecode } from "@icp-sdk/core/candid"
import { Principal } from "@icp-sdk/core/principal"

import { CertificateTimeError, CertificateVerificationError } from "./error"
import { getLookupResultValue } from "./utils"

export interface VerifyCertificationParams {
  canisterId: Principal
  encodedCertificate: ArrayBuffer | Uint8Array
  encodedTree: ArrayBuffer | Uint8Array
  rootKey: ArrayBuffer | Uint8Array
  maxCertificateTimeOffsetMs: number
}

export async function verifyCertification({
  canisterId,
  encodedCertificate,
  encodedTree,
  rootKey,
  maxCertificateTimeOffsetMs,
}: VerifyCertificationParams): Promise<HashTree> {
  const nowMs = Date.now()
  const certificate = await Certificate.create({
    certificate: new Uint8Array(encodedCertificate),
    principal: { canisterId },
    rootKey: new Uint8Array(rootKey),
  })
  const tree = Cbor.decode<HashTree>(new Uint8Array(encodedTree))
  validateCertificateTime(certificate, maxCertificateTimeOffsetMs, nowMs)
  await validateTree(tree, certificate, canisterId)

  return tree
}

function validateCertificateTime(
  certificate: Certificate,
  maxCertificateTimeOffsetMs: number,
  nowMs: number,
): void {
  const lookupResult = certificate.lookup_path(["time"])
  const value = getLookupResultValue(lookupResult)

  if (value) {
    const certificateTimeNs = lebDecode(new PipeArrayBuffer(value))
    const certificateTimeMs = Number(certificateTimeNs / BigInt(1_000_000))

    if (certificateTimeMs - maxCertificateTimeOffsetMs > nowMs) {
      throw new CertificateTimeError(
        `Invalid certificate: time ${certificateTimeMs} is too far in the future (current time: ${nowMs})`,
      )
    }

    if (certificateTimeMs + maxCertificateTimeOffsetMs < nowMs) {
      throw new CertificateTimeError(
        `Invalid certificate: time ${certificateTimeMs} is too far in the past (current time: ${nowMs})`,
      )
    }
  } else {
    throw new CertificateTimeError("Time not found in the certificate.")
  }
}

async function validateTree(
  tree: HashTree,
  certificate: Certificate,
  canisterId: Principal,
): Promise<void> {
  const treeRootHash = await reconstruct(tree)
  const certifiedData = certificate.lookup_path([
    "canister",
    canisterId.toUint8Array(),
    "certified_data",
  ])
  const value = getLookupResultValue(certifiedData)

  if (value) {
    if (!equal(value, treeRootHash)) {
      throw new CertificateVerificationError(
        "Tree root hash did not match the certified data in the certificate.",
      )
    }
  } else {
    throw new CertificateVerificationError("Certified data not found.")
  }
}

function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
