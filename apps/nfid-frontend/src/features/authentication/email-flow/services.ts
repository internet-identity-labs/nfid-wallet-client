import { DelegationIdentity } from "@dfinity/identity"

import { deviceInfo } from "frontend/integration/device"

import { AuthWithEmailMachineContext } from "./machine"

export interface KeyPair {
  publicKey: string
  privateKey: string
}

export const sendVerificationEmail = async (
  context: AuthWithEmailMachineContext,
): Promise<{
  requestId: string
  keyPair: KeyPair
}> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.debug("sendVerificationEmail", {
    verificationMethod: "email",
    emailAddress: context.email,
    metadata: {
      browserName: deviceInfo.browser.name, // "Chrome" | "Safari" | "Firefox"
      os: deviceInfo.platform.os, // "Mac OS"  | "Windows" | "iOS"
      device: deviceInfo.platform.device, // "Mac" | "Windows" | "iPhone"
      make: deviceInfo.platform.make, // "Apple" | "Microsoft"
    },
  })

  return {
    requestId: "123",
    keyPair: {
      publicKey: "123",
      privateKey: "123",
    },
  }
}

export const checkEmailVerification = async (
  context: AuthWithEmailMachineContext,
): Promise<DelegationIdentity> => {
  const verificationMethod = "email"

  console.debug("checkEmailVerification", {
    verificationMethod,
    requestId: context.requestId,
    keyPair: context.keyPair,
  })

  const mockedDelegationIdentity = {
    getDelegation: () => ({
      delegations: [
        {
          delegation: {
            expiration: BigInt(Date.now() + 2 * 60 * 1000) * BigInt(1000000),
          },
        },
      ],
    }),
  } as DelegationIdentity
  await new Promise((resolve) => setTimeout(resolve, 5000))

  return mockedDelegationIdentity
}
