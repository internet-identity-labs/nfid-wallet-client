import {
  LookupResult,
  LookupPathResultAbsent,
  LookupPathResultFound,
  LookupPathResultUnknown,
  LookupPathStatus,
} from "@icp-sdk/core/agent"

import { CertificateVerificationError } from "./error"

const isLookupResultFound = (
  result: LookupResult,
): result is LookupPathResultFound => {
  return (result as LookupPathResultFound).status === LookupPathStatus.Found
}

const isLookupResultUnknown = (
  result: LookupResult,
): result is LookupPathResultUnknown => {
  return (result as LookupPathResultUnknown).status === LookupPathStatus.Unknown
}

const isLookupResultAbsent = (
  result: LookupResult,
): result is LookupPathResultAbsent => {
  return (result as LookupPathResultAbsent).status === LookupPathStatus.Absent
}

export const getLookupResultValue = (
  result: LookupResult,
): Uint8Array | undefined => {
  if (!result) {
    throw new CertificateVerificationError("Certified data couldn't be found")
  }

  if (isLookupResultUnknown(result)) {
    throw new CertificateVerificationError("Certified data is unknown")
  }

  if (isLookupResultAbsent(result)) {
    throw new CertificateVerificationError("Certified data is absent")
  }

  if (isLookupResultFound(result)) {
    return result.value
  }

  throw new CertificateVerificationError(
    "Certified data has an unexpected format",
  )
}
