import WalletConnectProvider from "@walletconnect/ethereum-provider"
import { providers } from "ethers"
import Web3Modal from "web3modal"

import {
  authState as asyncAuthState,
  im,
  requestFEDelegation,
} from "@nfid/integration"

import { WalletConnectAuthSession } from "frontend/state/authentication"

import { fetchProfile } from "../identity-manager"
import { getIdentity } from "./metamask"

const getWalletConnectSignature = async () => {
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: false,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: WALLET_CONNECT_PROJECT_ID,
        },
      },
    },
  })

  const web3Provider = await web3Modal.connect()

  const accounts = (await web3Provider.enable()) as string[]

  const provider = new providers.Web3Provider(web3Provider)
  console.log({ provider })

  const signature = await provider.send("personal_sign", [
    METAMASK_SIGNIN_MESSAGE,
    accounts[0],
  ])

  return {
    accounts,
    signature,
    source: web3Provider.signer.connection.wc._peerMeta.name,
  }
}

/**
 * Create an auth session from wallet connect
 * @returns an AuthSession powered by WalletConnect
 */
// we need to make it reusable
export async function getWalletConnectAuthSession() {
  const { signature, accounts, source } = await getWalletConnectSignature()

  const identity = await getIdentity(signature)

  const { delegationIdentity } = await requestFEDelegation(identity)

  // We must call use_access_point (idk y), and we need to update the global agent identity to do so. I don't love putting this global auth state here.
  const authState = await asyncAuthState
  authState.set({ identity, delegationIdentity })

  let profile
  try {
    profile = await fetchProfile()
    im.use_access_point([accounts[0]]).catch((error) => {
      throw new Error(
        `getWalletConnectAuthSession im.use_access_point: ${error.message}`,
      )
    })
  } catch (fetchProfileError: any) {
    if (fetchProfileError.code !== 404) {
      throw fetchProfileError
    }
  }

  const session = {
    sessionSource: source.toLowerCase(),
    anchor: profile?.anchor,
    identity: identity,
    delegationIdentity: delegationIdentity,
  } as WalletConnectAuthSession

  return session
}
