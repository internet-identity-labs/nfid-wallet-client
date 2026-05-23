import { AuthClient } from "@icp-sdk/auth/client"
import { DelegationIdentity } from "@icp-sdk/core/identity"

import { authState, im } from "@nfid/integration"

import { IIAuthSession } from "frontend/state/authentication"

import { fetchProfile } from "../identity-manager"

export const signinWithII = async (): Promise<DelegationIdentity> => {
  const authClient = new AuthClient({
    identityProvider:
      FRONTEND_MODE === "development"
        ? `https://${INTERNET_IDENTITY_CANISTER_ID}.ic0.app/#authorize`
        : `https://identity.ic0.app/#authorize`,
    windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
  })
  return (await authClient.signIn()) as DelegationIdentity
}

/**
 * Create an auth session from II sdk
 * @returns an II powered auth session
 */
export const getIIAuthSessionService = async () => {
  const identity = await signinWithII()

  // We must call use_access_point (idk y), and we need to update the global agent identity to do so. I don't love putting this global auth state here.
  await authState.set({ identity, delegationIdentity: identity })

  let profile
  try {
    profile = await fetchProfile()

    await im
      .use_access_point([identity.getPrincipal().toString()])
      .catch((error) => {
        throw new Error(
          `getIIAuthSession im.use_access_point: ${error.message}`,
        )
      })

    const isAccessPointPresent = profile.accessPoints.find(
      (a) => a.principalId === identity.getPrincipal().toString(),
    )

    if (!isAccessPointPresent) {
      throw new Error(
        "We cannot find your II device. You need to add it firstly.",
      )
    }
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
