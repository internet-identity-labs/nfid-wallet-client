import { AuthClient } from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"

import { authState, ii, im } from "@nfid/integration"

import { IIAuthSession } from "frontend/state/authentication"

import { getBrowserName } from "../device"
import { fetchProfile } from "../identity-manager"

declare const II_PROVIDER: string

export const signinWithII = async () => {
  const authClient = await AuthClient.create()
  return new Promise(async (resolve, reject) => {
    authClient.login({
      onSuccess: () => {
        const delegation = authClient.getIdentity() as DelegationIdentity
        resolve(delegation)
      },
      onError: (error) => {
        console.error(error)
        reject()
      },
      identityProvider: `${II_PROVIDER}/#authorize`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  })
}

/**
 * Create an auth session from II sdk
 * @returns an II powered auth session
 */
export const getIIAuthSessionService = async () => {
  const identity = (await signinWithII()) as DelegationIdentity

  // // We must call use_access_point (idk y), and we need to update the global agent identity to do so. I don't love putting this global auth state here.
  authState.set(identity, identity, ii)

  let profile
  try {
    profile = await fetchProfile()
    im.use_access_point([getBrowserName()]).catch((error) => {
      throw new Error(`getIIAuthSession im.use_access_point: ${error.message}`)
    })
  } catch (fetchProfileError: any) {
    if (fetchProfileError.code !== 404) {
      throw fetchProfileError
    }
  }

  const session = {
    sessionSource: "ii",
    anchor: profile?.anchor,
    identity: identity,
    delegationIdentity: identity,
  } as IIAuthSession

  return session
}
