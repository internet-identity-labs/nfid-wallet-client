import { Secp256k1KeyIdentity } from "@dfinity/identity"
import { providers } from "ethers"
import sha256 from "sha256"

import {
  authState,
  ethSecretStorage,
  ii,
  im,
  requestFEDelegation,
} from "@nfid/integration"

import { MetamaskAuthSession } from "frontend/state/authentication"

import { fetchProfile } from "../identity-manager"

declare const METAMASK_SIGNIN_MESSAGE: string

export async function getIdentityByMessageAndWallet(
  signature: string,
): Promise<Secp256k1KeyIdentity> {
  const secret: string = await ethSecretStorage.secret_by_signature(signature)
  const seed: Uint8Array = new Uint8Array(
    sha256(signature + secret, { asBytes: true }),
  )
  const identity = Secp256k1KeyIdentity.generate(seed)
  return identity
}

/**
 * Request to window.ethereum for metamask signature
 * @returns a string contains signature
 */
export async function getMetamaskSignature() {
  const eth = (window as any).ethereum as providers.ExternalProvider
  if (!eth || !eth.request) throw new Error("Please install Metamask extension")

  const accounts = await eth.request({ method: "eth_requestAccounts" })

  const signature = await eth.request({
    method: "personal_sign",
    params: [METAMASK_SIGNIN_MESSAGE, accounts[0]],
  })

  return { signature, accounts }
}

/**
 * Create an auth session from II sdk
 * @returns an AuthSession powered by Metamask
 */
// TODO this function is same with signin-with-ii
// we need to make it reusable
export async function getMetamaskAuthSession() {
  const { signature, accounts } = await getMetamaskSignature()

  const identity = await getIdentityByMessageAndWallet(signature)

  const { delegationIdentity } = await requestFEDelegation(identity)

  // We must call use_access_point (idk y), and we need to update the global agent identity to do so. I don't love putting this global auth state here.
  authState.set(identity, delegationIdentity, ii)

  let profile
  try {
    profile = await fetchProfile()
    im.use_access_point([accounts[0]]).catch((error) => {
      throw new Error(
        `getMetamaskAuthSession im.use_access_point: ${error.message}`,
      )
    })
  } catch (fetchProfileError: any) {
    if (fetchProfileError.code !== 404) {
      throw fetchProfileError
    }
  }

  const session = {
    sessionSource: "metamask",
    anchor: profile?.anchor,
    identity: identity,
    delegationIdentity: delegationIdentity,
  } as MetamaskAuthSession

  return session
}
