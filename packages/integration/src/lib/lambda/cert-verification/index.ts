import {
  Cbor,
  Certificate,
  HashTree,
  reconstruct,
  compare, HttpAgent,
} from "@dfinity/agent"
import { PipeArrayBuffer, lebDecode } from "@dfinity/candid"
import { Principal } from "@dfinity/principal"

import { CertificateTimeError, CertificateVerificationError } from "./error"

export interface VerifyCertificationParams {
  canisterId: Principal
  encodedCertificate: ArrayBuffer
  encodedTree: ArrayBuffer
  rootKey: ArrayBuffer
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

  //uncomment after agent.js upgrade to 18.1
  // const certificate = await Certificate.create({
  //   certificate: encodedCertificate,
  //   canisterId,
  //   rootKey,
  // })

  const agent = new HttpAgent({ host: IC_HOST })
  await agent.fetchRootKey()
  const certificate = await new Certificate( {
    certificate: encodedCertificate,
  }, agent)
  await certificate.verify()
  const tree = Cbor.decode<HashTree>(encodedTree)

  validateCertificateTime(certificate, maxCertificateTimeOffsetMs, nowMs)
  await validateTree(tree, certificate, canisterId)

  return tree
}

function validateCertificateTime(
  certificate: Certificate,
  maxCertificateTimeOffsetMs: number,
  nowMs: number,
): void {
  const certificateTimeNs = lebDecode(
    new PipeArrayBuffer(certificate.lookup(["time"])),
  )
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
}

async function validateTree(
  tree: HashTree,
  certificate: Certificate,
  canisterId: Principal,
): Promise<void> {
  const treeRootHash = await reconstruct(tree)
  const certifiedData = certificate.lookup([
    "canister",
    canisterId.toUint8Array(),
    "certified_data",
  ])

  if (!certifiedData) {
    throw new CertificateVerificationError(
      "Could not find certified data in the certificate.",
    )
  }

  if (!equal(certifiedData, treeRootHash)) {
    throw new CertificateVerificationError(
      "Tree root hash did not match the certified data in the certificate.",
    )
  }
}

function equal(a: ArrayBuffer, b: ArrayBuffer): boolean {
  return compare(a, b) === 0
}