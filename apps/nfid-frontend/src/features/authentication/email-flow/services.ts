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
import { Chain, getGlobalKeys } from "packages/integration/src/lib/lambda/ecdsa"

import {
  SendVerificationResponse,
  VerificationMethod,
  authState,
  im,
  replaceActorIdentity,
  setProfile,
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
      emailAddress: context.email,
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
    emailAddress: context.email,
    keyPair: context.keyPair,
  })

  return new Promise((resolve) => {
    let nonce = 0
    const int = setInterval(async () => {
      try {
        nonce++
        const res = await verificationService.checkVerification(
          verificationMethod,
          context.email,
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
    }, 5000)
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

export const prepareGlobalDelegation = async (
  context: AuthWithEmailMachineContext,
): Promise<AuthSession> => {
  if (!context?.emailDelegation) throw new Error("No email delegation")

  await replaceActorIdentity(im, context.delegation as DelegationIdentity)
  try {
    const nfidProfile = await fetchProfile()
    console.log({ nfidProfile })
  } catch (e) {
    await createNFIDProfile(context.delegation as DelegationIdentity)
  }

  const delegation = await getGlobalKeys(
    context.chainRoot as DelegationChain,
    context.emailDelegation,
    Chain.IC,
    ["74gpt-tiaaa-aaaak-aacaa-cai"],
  )

  authState.set({
    delegationIdentity: context.delegation as DelegationIdentity,
    sessionKey: context.emailDelegation,
    chain: context.chainRoot,
    globalKey: delegation,
  })

  await authStorage.set(
    KEY_STORAGE_KEY,
    JSON.stringify(context.emailDelegation.toJSON()),
  )
  await authStorage.set(
    KEY_STORAGE_DELEGATION,
    JSON.stringify(context.chainRoot?.toJSON()),
  )

  const profile = await fetchProfile()
  setProfile(profile)

  const session = {
    sessionSource: "google",
    anchor: profile?.anchor,
    delegationIdentity: delegation,
  } as AuthSession

  return session
}
