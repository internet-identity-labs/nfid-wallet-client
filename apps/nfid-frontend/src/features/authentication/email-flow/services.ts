import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Chain, getGlobalKeys } from "packages/integration/src/lib/lambda/ecdsa"

import {
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
      emailAddress: context.email,
    })
  } catch (e) {
    throw e
  }
}

export const checkEmailVerification = async (
  context: AuthWithEmailMachineContext,
): Promise<{ identity: Ed25519KeyIdentity; chainRoot: DelegationChain }> => {
  const verificationMethod = "email"

  console.debug("checkEmailVerification", {
    verificationMethod,
    emailAddress: context.email,
    keyPair: context.keyPair,
  })

  return new Promise((resolve) => {
    const int = setInterval(async () => {
      try {
        const res = await verificationService.checkVerification(
          verificationMethod,
          context.email,
          context.keyPair!,
          context.requestId,
          0,
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

  let del: any, prof: any

  try {
    // const sessionKey = Ed25519KeyIdentity.generate()
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
    })

    const profile = await fetchProfile()
    del = delegation
    prof = profile
  } catch (e) {
    console.log({ e })
  }

  const session = {
    sessionSource: "google",
    anchor: prof?.anchor,
    delegationIdentity: del,
  } as AuthSession

  return session
}
