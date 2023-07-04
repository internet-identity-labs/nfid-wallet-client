import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import {
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
  authStorage,
} from "packages/integration/src/lib/authentication/storage"

import {
  Profile,
  SendVerificationResponse,
  VerificationMethod,
  authState,
  im,
  replaceActorIdentity,
  verificationService,
} from "@nfid/integration"

import {
  createNFIDProfile,
  fetchProfile,
} from "frontend/integration/identity-manager"
import { AuthSession } from "frontend/state/authentication"

import { AuthWithEmailMachineContext } from "./machine"

export const sendVerificationEmail = async (
  context: AuthWithEmailMachineContext,
): Promise<SendVerificationResponse> => {
  try {
    return await verificationService.sendVerification({
      verificationMethod: "email",
      emailAddress: context.verificationEmail,
    })
  } catch (e) {
    throw e
  }
}

export const checkEmailVerification = async (
  context: AuthWithEmailMachineContext,
): Promise<{
  identity: Ed25519KeyIdentity
  chainRoot: DelegationChain
  delegation: DelegationIdentity
}> => {
  const verificationMethod = "email"

  console.debug("checkEmailVerification", {
    verificationMethod,
    emailAddress: context.verificationEmail,
    keyPair: context.keyPair,
  })

  return new Promise((resolve) => {
    let nonce = 0
    const int = setInterval(async () => {
      try {
        nonce++
        const res = await verificationService.checkVerification(
          verificationMethod,
          context.verificationEmail,
          context.keyPair!,
          context.requestId,
          nonce - 1,
        )
        if (res) {
          clearInterval(int)
          resolve(res)
        }
      } catch (e) {
        console.log("ERROR", e)
      }
    }, 3000)
  })
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

export const linkGoogle = async (token: string): Promise<void> => {
  try {
    return await verificationService.linkGoogleAccount(token)
  } catch (e) {
    throw e
  }
}

export const authorizeWithEmail = async (
  context: AuthWithEmailMachineContext,
): Promise<AuthSession> => {
  if (!context?.emailDelegation) throw new Error("No email delegation")

  let profile: Profile
  const delegationIdentity = context.delegation // email delegation

  try {
    await replaceActorIdentity(im, delegationIdentity)
    profile = await fetchProfile()
  } catch (e) {
    console.log("creating new profile")
    profile = await createNFIDProfile(delegationIdentity)
  }

  authState.set({
    delegationIdentity,
    chain: context.chainRoot,
    sessionKey: context.emailDelegation,
    identity: delegationIdentity,
  })

  await authStorage.set(
    KEY_STORAGE_KEY,
    JSON.stringify(context.emailDelegation.toJSON()),
  )
  await authStorage.set(
    KEY_STORAGE_DELEGATION,
    JSON.stringify(context.chainRoot?.toJSON()),
  )

  const session = {
    sessionSource: "email",
    anchor: profile?.anchor,
    delegationIdentity,
    identity: context.emailDelegation,
  } as AuthSession

  return session
}
