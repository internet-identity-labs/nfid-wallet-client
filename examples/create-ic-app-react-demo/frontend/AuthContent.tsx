import { useInternetIdentity } from "@identity-labs/react-ic-ii-auth"
import React from "react"

import nfid from "./assets/nfid-logo.svg"

export const AuthContent = () => {
  const { signout, authenticate, isAuthenticated, identity } =
    useInternetIdentity()

  const handleAuthenticate = React.useCallback(async () => {
    await authenticate()
  }, [authenticate])

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={() => handleAuthenticate()} className="auth-button">
          Sign in with
          <img src={nfid} alt="" />
        </button>
      ) : null}

      {isAuthenticated ? (
        <div className="signout">
          <span>
            <strong>Signed in as: </strong>
            {identity?.getPrincipal().toText()}
          </span>
          <button onClick={signout} className="auth-button">
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
