import { ActorSubclass, HttpAgent } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"

import { mapDate, mapOptional } from "../_common"
import { Certificate as ExternalCertificate } from "../_ic_api/verifier.did"
import { _SERVICE as Verifier } from "../_ic_api/verifier.did.d"
import { idlFactory as verifierIDL } from "../_ic_api/verifier_idl"
import { actor, ic } from "../actors"

export interface Certificate {
  domain: string
  clientPrincipal: string
  phoneNumberSha2?: string
  createdDate: Date
}

declare const VERIFIER_CANISTER_ID: string

/**
 * First step to create a phone credential. Must be called with the application scoped delegation identity.
 * @param domain The domain of the client app requesting the credential. Credentials are restricted such that 1) a phone number can only be linked to one NFID, 2) a phone number can only be linked to one persona per domain. This parameter provides the data to power the second constraint.
 */
async function generatePhoneToken(
  domain: string,
  verifier: ActorSubclass<Verifier>,
) {
  return verifier.generate_pn_token(domain)
}

/**
 * Second step to create a phone credential. Must be called with the root NFID identity. By performing the correct sequence of calls with specified identities, we create a credential that links the principals without passing knowledge of the root principal to the client application.
 */
async function resolveToken(
  token: number[],
  verifier: ActorSubclass<Verifier>,
) {
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

export async function getPhoneCredential(
  appIdentity: DelegationIdentity,
  nfidIdentity: DelegationIdentity,
  domain: string,
) {
  console.debug(getPhoneCredential.name, {
    appId: appIdentity.getPrincipal().toText(),
    nfidId: nfidIdentity.getPrincipal().toText(),
  })
  // Breaking out of our actor pattern, because we need to use multiple identities.
  const agent = new HttpAgent({ host: ic.host })
  agent.replaceIdentity(appIdentity)
  const verifier = actor<Verifier>(VERIFIER_CANISTER_ID, verifierIDL, { agent })
  console.debug(generatePhoneToken.name, {
    domain,
    caller: (await agent.getPrincipal()).toText(),
  })
  const token = await generatePhoneToken(domain, verifier).catch((r) => {
    console.error("Error with token generation", r)
    throw r
  })
  agent.replaceIdentity(nfidIdentity)
  console.debug(resolveToken.name, {
    token,
    caller: (await agent.getPrincipal()).toText(),
  })
  for (let i = 0; i < 10; i++) {
    // Linear backoff
    await new Promise((resolve) => {
      setInterval(resolve, 1000 * i)
    })
    try {
      const credential = await resolveToken(token, verifier).catch((r) => {
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
