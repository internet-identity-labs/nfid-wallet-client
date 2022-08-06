import { mapDate, mapOptional } from "../_common"
import { Certificate as ExternalCertificate } from "../_ic_api/verifier.did"
import { verifier } from "../actors"

export interface Certificate {
  domain: string
  clientPrincipal: string
  phoneNumberSha2?: string
  createdDate: Date
}

/**
 * Second step to create a phone credential. Must be called with the root NFID identity. By performing the correct sequence of calls with specified identities, we create a credential that links the principals without passing knowledge of the root principal to the client application.
 */
async function resolveToken(token: number[]) {
  return verifier.resolve_token(token).then(mapOptional).then(mapCertificate)
}

function mapCertificate(
  certificate?: ExternalCertificate,
): Certificate | undefined {
  return certificate
    ? {
        domain: certificate.domain,
        clientPrincipal: certificate.client_principal,
        phoneNumberSha2: mapOptional(certificate.phone_number_sha2),
        createdDate: mapDate(certificate.created_date),
      }
    : certificate
}

export async function getPhoneCredential(token: number[]) {
  console.debug(resolveToken.name, {
    token,
  })
  for (let i = 0; i < 10; i++) {
    // Linear backoff
    await new Promise((resolve) => {
      setInterval(resolve, 1000 * i)
    })
    try {
      const credential = await resolveToken(token).catch((r) => {
        console.error("Error with token resolution", r)
        throw r
      })

      return credential
    } catch (e) {
      console.log("retrying...")
    }
  }
  throw new Error(`Failed to retrieve a delegation after ${10} retries.`)
}
