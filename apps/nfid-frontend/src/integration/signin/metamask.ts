import { Secp256k1KeyIdentity } from "@dfinity/identity"
import { configureChains, createClient, signMessage } from "@wagmi/core"
import {
  mainnet,
  arbitrum,
  avalanche,
  bsc,
  fantom,
  optimism,
  polygon,
} from "@wagmi/core/chains"
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum"
import { Web3Modal } from "@web3modal/html"
import { ethers, providers } from "ethers"

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
declare const WALLET_CONNECT_PROJECT_ID: string

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

export async function getWalletConnectSignature() {
  const chains = [mainnet, arbitrum, avalanche, bsc, fantom, optimism, polygon]

  const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId: WALLET_CONNECT_PROJECT_ID }),
  ])
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({ appName: "web3Modal", chains }),
    provider,
  })

  const ethereumClient = new EthereumClient(wagmiClient, chains)
  const web3Modal = new Web3Modal(
    { projectId: WALLET_CONNECT_PROJECT_ID },
    ethereumClient,
  )

  web3Modal.closeModal()
  web3Modal.openModal()

  const signature: string = await new Promise((resolve, reject) => {
    let address: string
    web3Modal.subscribeSelectedChain((newState) => {
      console.log(newState)
      if (newState.address && newState.address !== address) {
        const signature = signMessage({ message: METAMASK_SIGNIN_MESSAGE })
        address = newState.address
        resolve(signature)
      }
    })
  })

  console.log(ethereumClient.getAccount())

  const accounts: string = ethereumClient.getAccount().address!
  web3Modal.closeModal()
  return { signature, accounts }
}

getWalletConnectSignature()

/**
 * Create an auth session from II sdk
 * @returns an AuthSession powered by Metamask
 */
// TODO this function is same with signin-with-ii
// we need to make it reusable
export async function getMetamaskAuthSession() {
  const { signature, accounts } = await getWalletConnectSignature()
  // const { signature, accounts } = await getWalletConnectSignature()

  const identity = await getIdentity(signature)

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
