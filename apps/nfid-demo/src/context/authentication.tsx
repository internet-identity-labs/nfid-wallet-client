import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import React, { useMemo } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { NFID } from "@nfid/embed"
import { useSWR } from "@nfid/swr"

type BaseKeyType = "ECDSA" | "Ed25519"

declare const NFID_PROVIDER_URL: string

interface AuthenticationContextProps {
  nfid?: NFID
  isLoadingNFID?: boolean
  identity?: SignIdentity
  delegationIdentity?: DelegationIdentity
  setIdentity: React.Dispatch<
    React.SetStateAction<DelegationIdentity | undefined>
  >
  keyType: BaseKeyType
  setKeyType: React.Dispatch<React.SetStateAction<BaseKeyType>>
  derivationOrigin?: string
  setDerivationOrigin: React.Dispatch<React.SetStateAction<string | undefined>>
  config?: {
    principalID: string
    address: string
    expirationTime: string
    targets: Principal[] | undefined
  }
}

const AuthenticationContext = React.createContext<AuthenticationContextProps>({
  keyType: "ECDSA",
  setIdentity: () => {
    throw new Error("setIdentity not implemented")
  },
  setKeyType: () => {
    throw new Error("setKeyType not implemented")
  },
  setDerivationOrigin: () => {
    throw new Error("setDerivationOrigin not implemented")
  },
})

declare const CANISTER_IDS: { [key: string]: { [key: string]: string } }

const origin = window.location.origin
const isStaging = origin.includes("-staging.nfid.one")
const isDev = origin.includes("-dev.nfid.one") || origin.includes("localhost")
const isProd = origin.includes(".nfid.one")

const derivationCanisterId = isDev
  ? CANISTER_IDS["nfid-demo"].dev
  : isStaging
    ? CANISTER_IDS["nfid-demo"].stage
    : isProd
      ? CANISTER_IDS["nfid-demo"].ic
      : undefined

const derivationOrigin =
  derivationCanisterId && `https://${derivationCanisterId}.ic0.app`

export const AuthenticationProvider: React.FC<{
  children: JSX.Element | JSX.Element[]
}> = ({ children }: any) => {
  const [identity, setIdentity] = React.useState<DelegationIdentity>()
  const [derivationOriginState, setDerivationOrigin] = React.useState<
    string | undefined
  >(derivationOrigin)

  const [keyType, setKeyType] = React.useState<BaseKeyType>("ECDSA")

  const { data: nfid, isLoading: isLoadingNFID } = useSWR(
    `nfid-${keyType}`,
    () =>
      NFID.init({
        origin: NFID_PROVIDER_URL,
        application: {
          name: "NFID Demo",
          logo: "https://avatars.githubusercontent.com/u/84057190?s=200&v=4",
        },
        ic: {
          derivationOrigin,
        },
        keyType,
      }),
    {
      revalidateOnFocus: false,
    },
  )

  const config = useMemo(() => {
    if (!identity) return

    const principal = Principal.selfAuthenticating(
      new Uint8Array(identity.getPublicKey().toDer()),
    )
    const principalID = principal.toString()
    const address = AccountIdentifier.fromPrincipal({
      principal,
    }).toHex()
    const expirationTime = new Date(
      Number(
        identity.getDelegation().delegations[0].delegation.expiration /
          BigInt(1_000_000),
      ),
    ).toString()
    const targets = identity.getDelegation().delegations[0].delegation.targets

    return {
      principalID,
      address,
      expirationTime,
      targets,
    }
  }, [identity])

  console.debug("AuthenticationProvider", {
    nfid,
    config,
    identity,
    derivationOrigin,
  })
  return (
    <AuthenticationContext.Provider
      value={{
        nfid,
        isLoadingNFID,
        identity,
        setIdentity,
        keyType,
        setKeyType,
        config,
        derivationOrigin: derivationOriginState,
        setDerivationOrigin,
      }}
    >
      <ToastContainer />

      {children}
    </AuthenticationContext.Provider>
  )
}

export const useAuthenticationContext = () => {
  const context = React.useContext(AuthenticationContext)
  if (!context) {
    throw new Error(
      "useAuthenticationContext must be used within a AuthenticationProvider",
    )
  }
  return context
}
