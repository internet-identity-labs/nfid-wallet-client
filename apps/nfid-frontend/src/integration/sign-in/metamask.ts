import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1"
import { ethers, providers } from "ethers"

import {
  authState,
  ethSecretStorage,
  im,
  requestFEDelegation,
} from "@nfid/integration"

import { MetamaskAuthSession } from "frontend/state/authentication"

import { fetchProfile } from "../identity-manager"

/**
 * Request secret from a canister based on signature and restored from it address.
 * @returns a Secp256k1KeyIdentity identity
 */
export async function getIdentity(
  signature: string,
): Promise<Secp256k1KeyIdentity> {
  const message: string = ethers.utils.hashMessage(METAMASK_SIGNIN_MESSAGE)
  const address: string = ethers.utils.recoverAddress(message, signature)
  const secret: string = await ethSecretStorage.get_secret(address, signature)
  const seed: Uint8Array = ethers.utils.arrayify(secret)
  return Secp256k1KeyIdentity.generate(seed)
}

/**
 * Request to window.ethereum for eth_requestAccounts
 * @returns an array of strings
 */
export async function getMetamaskAccounts() {
  const eth = (window as any).ethereum as providers.ExternalProvider
  if (!eth || !eth.request) throw new Error("Please install Metamask extension")

  const accounts = await eth.request({ method: "eth_requestAccounts" })

  return accounts
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

  const identity = await getIdentity(signature)

  const { delegationIdentity } = await requestFEDelegation(identity)

  // We must call use_access_point (idk y), and we need to update the global agent identity to do so. I don't love putting this global auth state here.
  authState.set({ identity, delegationIdentity })

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
