import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import {
  authStorage,
  KEY_STORAGE_KEY,
  KEY_STORAGE_DELEGATION,
} from "packages/integration/src/lib/authentication/storage"

import {
  Profile,
  RootWallet,
  authState as asyncAuthState,
  authenticationTracking,
  googleSigninV2Service,
  im,
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
    authenticationTracking.updateData({
      isNewUser: false,
    })
  } catch (e) {
    console.log("creating new profile")
    profile = await createNFIDProfile(delegation, email)
    authenticationTracking.updateData({
      isNewUser: true,
    })
  }
  authenticationTracking.updateData({
    rootWallet: profile.wallet === RootWallet.NFID,
  })

  const authState = await asyncAuthState
  authState.set({
    delegationIdentity: delegation,
    identity: identity,
  })

  authenticationTracking.completed({
    anchor: profile.anchor,
    hasEmail: !!profile.email,
    legacyUser: profile.wallet === RootWallet.II,
  })

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
