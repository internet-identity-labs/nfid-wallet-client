import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

import { authState, im } from "@nfid/integration"

import { IIAuthSession } from "frontend/state/authentication"
import { buildDelegate } from "frontend/integration/internet-identity/build-delegate"

import { fetchProfile } from "../identity-manager"

const II_DEFAULT_MAX_TIME_TO_LIVE = BigInt(28_800_000_000_000) // 8 hours in nanoseconds

export const signinWithII = async (): Promise<DelegationIdentity> => {
  const identityProvider =
    FRONTEND_MODE === "development"
      ? `https://${INTERNET_IDENTITY_CANISTER_ID}.ic0.app/#authorize`
      : `https://identity.ic0.app/#authorize`

  const sessionKey = Ed25519KeyIdentity.generate()
  const sessionPublicKey = new Uint8Array(sessionKey.getPublicKey().toDer())

  return new Promise((resolve, reject) => {
    const iiWindow = window.open(
      identityProvider,
      "ii-window",
      "toolbar=0,location=0,menubar=0,width=525,height=705",
    )

    if (!iiWindow) {
      reject(new Error("Could not open Internet Identity window"))
      return
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(identityProvider).origin) return

      const data = event.data
      if (!data || typeof data !== "object") return

      if (data.kind === "authorize-ready") {
        iiWindow.postMessage(
          {
            kind: "authorize-client",
            sessionPublicKey,
            maxTimeToLive: II_DEFAULT_MAX_TIME_TO_LIVE,
          },
          event.origin,
        )
      } else if (data.kind === "authorize-client-success") {
        window.removeEventListener("message", handleMessage)
        iiWindow.close()

        try {
          const delegations = data.delegations.map(buildDelegate)
          const chain = DelegationChain.fromDelegations(
            delegations.map((d: ReturnType<typeof buildDelegate>) => ({
              delegation: new Delegation(
                d.delegation.pubkey,
                d.delegation.expiration,
              ),
              signature: d.signature,
            })),
            new Uint8Array(data.userPublicKey),
          )
          resolve(DelegationIdentity.fromDelegation(sessionKey, chain))
        } catch (e) {
          reject(e)
        }
      } else if (data.kind === "authorize-client-failure") {
        window.removeEventListener("message", handleMessage)
        iiWindow.close()
        reject(
          new Error(data.text || "Internet Identity authentication failed"),
        )
      }
    }

    window.addEventListener("message", handleMessage)

    const checkClosed = setInterval(() => {
      if (iiWindow.closed) {
        clearInterval(checkClosed)
        window.removeEventListener("message", handleMessage)
        reject(new Error("Internet Identity window was closed"))
      }
    }, 500)
  })
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
