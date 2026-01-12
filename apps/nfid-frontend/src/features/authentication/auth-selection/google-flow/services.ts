import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import {
  authStorage,
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
} from "packages/integration/src/lib/authentication/storage"

import {
  authState,
  DeviceType,
  googleSigninV2Service,
  Icon,
  im,
  Profile,
  replaceActorIdentity,
} from "@nfid/integration"

import {
  createNFIDProfile,
  fetchProfile,
} from "frontend/integration/identity-manager"
import { GoogleAuthSession } from "frontend/state/authentication"

import { AuthWithGoogleMachineContext } from "./auth-with-google"

export const signWithGoogleService = async (
  context: AuthWithGoogleMachineContext,
): Promise<GoogleAuthSession> => {
  let delegation: DelegationIdentity, identity: Ed25519KeyIdentity
  let email: string

  try {
    const result = await googleSigninV2Service.signin(context.jwt)
    email = result.email
    delegation = result.delegation
    identity = result.identity
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }

  let profile: Profile
  try {
    await replaceActorIdentity(im, delegation)
    profile = await fetchProfile()
  } catch (_e) {
    console.log("creating new profile")
    profile = await createNFIDProfile({
      delegationIdentity: delegation,
      email,
      deviceType: DeviceType.Google,
      icon: Icon.google,
    })
  }

  // Only set auth state if 2FA is NOT enabled
  // If 2FA is enabled, checkIf2FAEnabled will handle it after verification
  if (!profile.is2fa) {
    await authState.set({
      delegationIdentity: delegation,
      identity: identity,
    })
  }

  if (!profile?.email?.length)
    await im.update_account({ name: [], email: [email] })

  await authStorage.set(KEY_STORAGE_KEY, JSON.stringify(identity.toJSON()))

  await authStorage.set(
    KEY_STORAGE_DELEGATION,
    JSON.stringify(delegation.getDelegation().toJSON()),
  )

  return {
    sessionSource: "google",
    anchor: profile.anchor,
    delegationIdentity: delegation,
    identity: identity,
  } as GoogleAuthSession
}
