import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import React, { useMemo } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useSWRImmutable from "swr/immutable"

import { NFID } from "@nfid/embed"

declare const NFID_PROVIDER_URL: string

interface AuthenticationContextProps {
  nfid?: NFID
  identity?: DelegationIdentity
  setIdentity: React.Dispatch<
    React.SetStateAction<DelegationIdentity | undefined>
  >
  config?: {
    principalID: string
    address: string
    expirationTime: number
    targets: Principal[] | undefined
  }
}

const AuthenticationContext = React.createContext<AuthenticationContextProps>({
  setIdentity: () => {
    throw new Error("setIdentity not implemented")
  },
})

export const AuthenticationProvider: React.FC<{
  children: JSX.Element | JSX.Element[]
}> = ({ children }: any) => {
  const [identity, setIdentity] = React.useState<DelegationIdentity>()
  const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )

  const config = useMemo(() => {
    if (!identity) return

    const principalID = identity.getPrincipal().toString()
    const address = principalToAddress(identity?.getPrincipal())
    const expirationTime = Number(
      identity.getDelegation().delegations[0].delegation.expiration,
    )
    const targets = identity.getDelegation().delegations[0].delegation.targets

    return {
      principalID,
      address,
      expirationTime,
      targets,
    }
  }, [identity])

  console.debug("AuthenticationProvider", { nfid, identity })
  return (
    <AuthenticationContext.Provider
      value={{ nfid, identity, setIdentity, config }}
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
