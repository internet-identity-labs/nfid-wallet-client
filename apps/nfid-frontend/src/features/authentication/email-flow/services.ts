import { DelegationIdentity } from "@dfinity/identity"

import { AuthWithEmailMachineContext } from "./machine"

export interface KeyPair {
  publicKey: string
  privateKey: string
}

export const sendVerificationEmail = async (
  context: AuthWithEmailMachineContext,
): Promise<{
  keyPair: KeyPair
}> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.debug("sendVerificationEmail", {
    verificationMethod: "email",
    emailAddress: context.email,
  })

  return {
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
    emailAddress: context.email,
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

export const verify = async (verificationMethod: string, token: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  if (token === "nfid") throw new Error("Invalid token")

  console.debug("verify", {
    verificationMethod,
    token: token,
  })

  return true
}
