import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import React from "react"

import logo from "./assets/dfinity.svg"
import nfid from "./assets/nfid-logo.svg"

export const AuthContent = ({ provider = "", reset = () => {} }) => {
  const { signout, authenticate, isAuthenticated, identity } =
    useInternetIdentity()

  const handleAuthenticate = React.useCallback(async () => {
    await authenticate()
  }, [authenticate])

  const signOut = () => {
    signout()
    reset()
  }

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={() => handleAuthenticate()} className="auth-button">
          Sign in with
          {provider === "NFID" ? (
            <img src={nfid} alt="" />
          ) : (
            <img src={logo} alt="" />
          )}
        </button>
      ) : null}

      {isAuthenticated ? (
        <div className="signout">
          <span>
            <strong>Signed in as: </strong>
            {identity?.getPrincipal().toText()}
          </span>
          <button onClick={signOut} className="auth-button">
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
