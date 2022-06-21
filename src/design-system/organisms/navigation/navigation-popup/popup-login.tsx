import { Button } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface PopupLoginProps {
  menu?: boolean
}

export const PopupLogin: React.FC<PopupLoginProps> = ({ menu = false }) => {
  const { readAccount, account } = useAccount()
  const { getPersona } = usePersona()
  const { login, user, logout } = useAuthentication()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      readAccount()
      getPersona()
    }
  }, [getPersona, user, readAccount])

  return (
    <div className="px-4 mx-auto">
      {!menu && (
        <h2 className="mt-5 text-xl font-bold text-left">
          {!user ? "Welcome " : "Logged in "}
          {account?.name ?? account?.anchor ?? ""}
        </h2>
      )}
      {user && account && (
        <Button
          primary
          className="w-full mt-4"
          onClick={() => navigate("/profile/authenticate")}
        >
          Profile
        </Button>
      )}
      {!user ? (
        <Button primary className="w-full mt-4" onClick={() => login()}>
          Log in
        </Button>
      ) : (
        <p
          onClick={logout}
          className="block mt-4 text-sm font-light text-center cursor-pointer text-blue-base"
        >
          Logout
        </p>
      )}
    </div>
  )
}
