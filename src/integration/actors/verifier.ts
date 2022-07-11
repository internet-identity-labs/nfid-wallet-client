import { verifier } from "."
import { Certificate as ExternalCertificate } from "../idl/verifier.did.d"
import { mapDate, mapOptional } from "./.common"

// TODO: Create fetch methods needed in the phone number credential flow
// - [ ] generate_pn_otk
// - [ ] get_delegation

export async function generatePNToken(phoneNumber: string) {
  console.log("requesting pn token")
  return await verifier.generate_pn_token(phoneNumber)
}

export interface Certificate {
  domain: string
  clientPrincipal: string
  phoneNumberSha2?: string
  createdDate: Date
}

function mapCertificate(certificate: ExternalCertificate): Certificate {
  return {
    domain: certificate.domain,
    clientPrincipal: certificate.client_principal,
    phoneNumberSha2: mapOptional(certificate.phone_number_sha2),
    createdDate: mapDate(certificate.created_date),
  }
}

export async function resolveToken(
  token: number[],
): Promise<Certificate | undefined> {
  const certificate = mapOptional(await verifier.resolve_token(token))
  return certificate ? mapCertificate(certificate) : certificate
}
