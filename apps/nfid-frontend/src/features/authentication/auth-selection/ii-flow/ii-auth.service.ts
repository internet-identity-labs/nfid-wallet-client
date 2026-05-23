import { SignIdentity } from "@icp-sdk/core/agent"
import { AuthClient } from "@icp-sdk/auth/client"
import { DelegationIdentity } from "@icp-sdk/core/identity"

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
export const derivationOrigin = NFID_WALLET_CLIENT_CANISTER

export async function signWithIIService(): Promise<IIAuthSession> {
  const authClient = new AuthClient({
    keyType: "Ed25519",
    storage: authStorage,
    identityProvider,
    derivationOrigin,
  })

  const identity = (await authClient.signIn()) as SignIdentity

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
      identity: identity,
      delegationIdentity: identity as DelegationIdentity,
    }

    if (!profile?.anchor) {
      throw new Error("Profile anchor is undefined")
    }

    if (!profile.is2fa) {
      await authState.set({
        identity: identity,
        delegationIdentity: identity as DelegationIdentity,
      })
    }

    return session
  } catch (e) {
    console.error("Error in signWithIIService", e)
    throw e
  }
}
