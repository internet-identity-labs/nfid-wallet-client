import { SignIdentity } from "@dfinity/agent"
import {
  AuthClient,
  InternetIdentityAuthResponseSuccess,
} from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"

import { authState, im, DeviceType, Icon } from "@nfid/integration"
import { IIAuthSession } from "frontend/state/authentication"

import {
  fetchProfile,
  createNFIDProfile,
} from "frontend/integration/identity-manager"

export const identityProvider = "https://identity.ic0.app"

export async function signWithIIService(): Promise<IIAuthSession> {
  console.log("signWithIIService")

  return new Promise((resolve, reject) => {
    AuthClient.create()
      .then((authClient) => {
        authClient.login({
          identityProvider,
          onSuccess: async (_: InternetIdentityAuthResponseSuccess) => {
            console.log("onSuccess")
            const identity = authClient.getIdentity() as SignIdentity
            console.log("identity", identity.getPrincipal().toText())

            try {
              let profile
              try {
                profile = await fetchProfile()
                await im.use_access_point([identity.getPrincipal().toString()])
              } catch (e) {
                console.log("creating new profile")
                profile = await createNFIDProfile({
                  delegationIdentity: identity,
                  email: undefined,
                  deviceType: DeviceType.InternetIdentity,
                  name: "Internet Identity",
                  icon: Icon.ii,
                })
              }

              const session: IIAuthSession = {
                sessionSource: "ii" as const,
                anchor: profile?.anchor,
                identity: identity,
                delegationIdentity: identity as DelegationIdentity,
              }

              if (!profile?.anchor) {
                throw new Error("Profile anchor is undefined")
              }

              await authState.set({
                identity: identity,
                delegationIdentity: identity as DelegationIdentity,
              })

              resolve(session)
            } catch (e) {
              console.error("Error in signWithIIService", e)
              reject(e)
            }
          },
          onError: (error) => {
            console.error("II login error", error)
            reject(error)
          },
        })
      })
      .catch(reject)
  })
}

export async function loginWithII(callback?: () => void) {
  console.log("loginWithII")

  try {
    const session = await signWithIIService()
    console.log("II login successful", session)
    callback?.()
    return session
  } catch (error) {
    console.error("II login failed", error)
    throw error
  }
}
