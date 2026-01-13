import { SignIdentity } from "@dfinity/agent"
import {
  AuthClient,
  InternetIdentityAuthResponseSuccess,
} from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"

import {
  authState,
  im,
  DeviceType,
  Icon,
  replaceActorIdentity,
} from "@nfid/integration"
import { authStorage } from "@nfid/integration"

import {
  fetchProfile,
  createNFIDProfile,
} from "frontend/integration/identity-manager"
import { IIAuthSession } from "frontend/state/authentication"

export const identityProvider = "https://id.ai"
export const derivationOrigin = CANISTER_WITH_AT_LEAST_ONE_PASSKEY

export async function signWithIIService(): Promise<IIAuthSession> {
  return new Promise((resolve, reject) => {
    AuthClient.create({ keyType: "Ed25519", storage: authStorage })
      .then((authClient) => {
        authClient.login({
          derivationOrigin,
          identityProvider,
          onSuccess: async (_: InternetIdentityAuthResponseSuccess) => {
            const identity = authClient.getIdentity() as SignIdentity

            try {
              let profile
              try {
                await replaceActorIdentity(im, identity)
                profile = await fetchProfile()
                await im.use_access_point([identity.getPrincipal().toString()])
              } catch (_e) {
                console.debug("creating new profile")
                profile = await createNFIDProfile({
                  delegationIdentity: identity,
                  email: undefined,
                  deviceType: DeviceType.InternetIdentity,
                  name: identity.getPrincipal().toText(),
                  icon: Icon.ii,
                })
              }

              const session: IIAuthSession = {
                sessionSource: "ii" as const,
                anchor: profile?.anchor,
                identity,
                delegationIdentity: identity as DelegationIdentity,
              }

              if (!profile?.anchor) {
                throw new Error("Profile anchor is undefined")
              }

              // Only set auth state if 2FA is NOT enabled
              // If 2FA is enabled, checkIf2FAEnabled will handle it after verification
              if (!profile.is2fa) {
                await authState.set({
                  identity,
                  delegationIdentity: identity as DelegationIdentity,
                })
              }

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
