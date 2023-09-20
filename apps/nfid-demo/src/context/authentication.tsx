import { Identity } from "@dfinity/agent"
import React from "react"
import useSWRImmutable from "swr/immutable"

import { NFID } from "@nfid/embed"

declare const NFID_PROVIDER_URL: string

interface AuthenticationContextProps {
  nfid?: NFID
  identity?: Identity
  setIdentity: React.Dispatch<React.SetStateAction<Identity | undefined>>
}

const AuthenticationContext = React.createContext<AuthenticationContextProps>({
  setIdentity: () => {
    throw new Error("setIdentity not implemented")
  },
})

export const AuthenticationProvider: React.FC<{
  children: JSX.Element | JSX.Element[]
}> = ({ children }: any) => {
  const [identity, setIdentity] = React.useState<Identity>()
  const { data: nfid } = useSWRImmutable("nfid", () =>
    NFID.init({ origin: NFID_PROVIDER_URL }),
  )
  console.debug("AuthenticationProvider", { nfid, identity })
  return (
    <AuthenticationContext.Provider value={{ nfid, identity, setIdentity }}>
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
