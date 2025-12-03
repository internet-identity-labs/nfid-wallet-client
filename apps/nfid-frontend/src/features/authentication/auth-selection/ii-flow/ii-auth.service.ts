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
import { IIAuthSession } from "frontend/state/authentication"

import {
  fetchProfile,
  createNFIDProfile,
} from "frontend/integration/identity-manager"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

export const identityProvider = "https://id.ai"
//who knows why FE canister URL named like this....
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
              } catch (e) {
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
                identity: identity,
                delegationIdentity: identity as DelegationIdentity,
              }

              if (!profile?.anchor) {
                throw new Error("Profile anchor is undefined")
              }

              // Only set auth state if 2FA is NOT enabled
              // If 2FA is enabled, checkIf2FAEnabled will handle it after verification
              if (!profile.is2fa) {
                await authState.set({
                  identity: identity,
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
