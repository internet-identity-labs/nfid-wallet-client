import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import React from "react"

import ii from "../assets/dfinity.svg"
import nfid from "../assets/nfid-logo.svg"
import { AuthContext } from "./AuthContext"
import { AuthIFrame } from "./AuthIFrame"

const ProvidersLogos: { [key: string]: string } = {
  NFID: nfid,
  II: ii,
}
interface IAuthButton {
  provider: string
}

export const AuthButton = ({ provider }: IAuthButton) => {
  const { isIframeOpened, setIsIframeOpened, setActiveProvider, isIframeMode } =
    React.useContext(AuthContext)
  const { signout, authenticate, isAuthenticated, identity, identityProvider } =
    useInternetIdentity()

  const signIn = () => {
    if (provider === "NFID" && isIframeMode) setIsIframeOpened(true)
    else authenticate()
  }

  return (
    <div>
      {isIframeOpened && provider === "NFID" && (
        <AuthIFrame
          identityProvider={identityProvider}
          handler={() => authenticate()}
        />
      )}
      {!isAuthenticated ? (
        <button onClick={signIn} className="auth-button">
          Sign in with
          <img src={ProvidersLogos[provider]} alt="" />
        </button>
      ) : (
        <div className="signout">
          <span>
            <strong>Signed in as: </strong>
            {identity?.getPrincipal().toText()}
          </span>
          <button
            onClick={() => {
              signout()
              setActiveProvider(null)
            }}
            className="auth-button"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
