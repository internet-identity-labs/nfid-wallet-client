import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@icp-sdk/core/identity"

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
import { buildDelegate } from "frontend/integration/internet-identity/build-delegate"

export const identityProvider = "https://identity.ic0.app/#authorize"
export const derivationOrigin = NFID_WALLET_CLIENT_CANISTER

const II_MAX_TIME_TO_LIVE = BigInt(28_800_000_000_000)

let pendingIIWindow: Window | null = null

export function openIIWindow() {
  pendingIIWindow = window.open(
    identityProvider,
    "ii-window",
    "toolbar=0,location=0,menubar=0,width=525,height=705",
  )
}

function signinWithII(): Promise<DelegationIdentity> {
  const sessionKey = Ed25519KeyIdentity.generate()
  const sessionPublicKey = new Uint8Array(sessionKey.getPublicKey().toDer())

  return new Promise((resolve, reject) => {
    const iiWindow = pendingIIWindow
    pendingIIWindow = null

    if (!iiWindow || iiWindow.closed) {
      reject(new Error("Could not open Internet Identity window"))
      return
    }

    const expectedOrigin = new URL(identityProvider).origin

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return

      const data = event.data
      if (!data || typeof data !== "object") return

      if (data.kind === "authorize-ready") {
        iiWindow.postMessage(
          {
            kind: "authorize-client",
            sessionPublicKey,
            maxTimeToLive: II_MAX_TIME_TO_LIVE,
            derivationOrigin,
          },
          event.origin,
        )
      } else if (data.kind === "authorize-client-success") {
        window.removeEventListener("message", handleMessage)
        clearInterval(checkClosed)
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
        clearInterval(checkClosed)
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

export async function signWithIIService(): Promise<IIAuthSession> {
  const identity = await signinWithII()

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
      delegationIdentity: identity,
    }

    if (!profile?.anchor) {
      throw new Error("Profile anchor is undefined")
    }

    if (!profile.is2fa) {
      await authState.set({
        identity: identity,
        delegationIdentity: identity,
      })
    }

    return session
  } catch (e) {
    console.error("Error in signWithIIService", e)
    throw e
  }
}
