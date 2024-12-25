import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import {
  authStorage,
  KEY_STORAGE_KEY,
  KEY_STORAGE_DELEGATION,
} from "packages/integration/src/lib/authentication/storage"

import {
  Profile,
  authState,
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
    console.log('googleSigninV2Service.sigin')
    const result = await googleSigninV2Service.signin(context.jwt)
    console.log('googleSigninV2Service.sigin res', result)
    email = result.email
    delegation = result.delegation
    identity = result.identity
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }

  let profile: Profile
  try {
    console.log('replaceActorIdentity.sigin')
    await replaceActorIdentity(im, delegation)
    console.log('fetchProfile.sigin')
    profile = await fetchProfile()
    console.log('fetchProfile.sigin profile', profile)
  } catch (e) {
    console.log("creating new profile")
    profile = await createNFIDProfile({
      delegationIdentity: delegation,
      email,
      isGoogle: true,
    })
  }

  await authState.set({
    delegationIdentity: delegation,
    identity: identity,
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
