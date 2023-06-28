import { DelegationIdentity } from "@dfinity/identity"

import {
  SendVerificationResponse,
  VerificationMethod,
  verificationService,
} from "@nfid/integration"

import { AuthWithEmailMachineContext } from "./machine"

export const sendVerificationEmail = async (
  context: AuthWithEmailMachineContext,
): Promise<SendVerificationResponse> => {
  try {
    const sendVerificationResponse = await verificationService.sendVerification(
      {
        verificationMethod: "email",
        emailAddress: context.email,
      },
    )
    return sendVerificationResponse
  } catch (e) {
    throw e
  }
}

export const checkEmailVerification = async (
  context: AuthWithEmailMachineContext,
): Promise<DelegationIdentity> => {
  const verificationMethod = "email"

  console.debug("checkEmailVerification", {
    verificationMethod,
    emailAddress: context.email,
    keyPair: context.keyPair,
  })

  try {
    return verificationService.checkVerification(
      verificationMethod,
      context.email,
      context.keyPair,
      context.requestId,
      0,
    )
  } catch (e) {
    throw e
  }
}

export const verify = async (
  verificationMethod: VerificationMethod,
  token: string,
): Promise<{ status: "success" | "invalid-token" | "link-required" }> => {
  console.debug("verify", {
    verificationMethod,
    token: token,
  })

  try {
    const status = await verificationService.verify(verificationMethod, token)
    return { status }
  } catch (e) {
    throw e
  }
}
