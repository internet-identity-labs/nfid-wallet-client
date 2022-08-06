import { AuthSession } from "frontend/state/authentication"

import { verifyPhoneNumber } from "."

/**
 * xstate service to send sms verification code.
 */
export async function verifyPhoneNumberService(context: {
  authSession?: AuthSession
  phone?: string
}) {
  try {
    const { authSession, phone } = context
    if (!authSession) throw new Error("Missing session")
    if (!phone) throw new Error("Missing phone number")
    const identity = authSession.delegationIdentity
    console.debug(verifyPhoneNumberService.name, {
      principal: identity.getPrincipal().toText(),
      context,
    })
    return await verifyPhoneNumber(phone, identity)
  } catch (e) {
    console.error("Error in verifyPhoneNumberService", e)
    throw new Error(
      "There was an issue verifying your phone number, please try again.",
    )
  }
}
