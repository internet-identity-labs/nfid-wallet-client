import { DelegationIdentity } from "@dfinity/identity"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizationRequest } from "frontend/state/authorization"

import { getPhoneCredential } from "."

export async function generateCredential(
  context: {
    authSession?: AuthSession
    authoIdentity?: DelegationIdentity
    authoRequest?: AuthorizationRequest
  },
  event: any,
) {
  const { authSession: nfidId, authoIdentity: appId, authoRequest } = context
  if (!nfidId) throw new Error("Missing nfid id")
  if (!appId) throw new Error("Missing app id")
  if (!authoRequest) throw new Error("Missing auth request")
  console.debug(generateCredential.name, {
    appId,
    nfidId: nfidId.delegationIdentity,
    hostname: authoRequest.hostname,
  })
  return getPhoneCredential(
    appId,
    nfidId.delegationIdentity,
    authoRequest.hostname,
  )
}
