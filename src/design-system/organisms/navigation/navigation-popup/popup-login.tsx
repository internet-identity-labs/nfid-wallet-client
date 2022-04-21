import { Button } from "@internet-identity-labs/nfid-sdk-react"
import React, { useEffect } from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface PopupLoginProps {}

export const PopupLogin: React.FC<PopupLoginProps> = ({ children }) => {
  const { userNumber, readAccount, account } = useAccount()
  const { login, isAuthenticated, logout, identityManager } =
    useAuthentication()

  useEffect(() => {
    readAccount(identityManager, userNumber)
  }, [identityManager, readAccount, userNumber])

  return (
    <div className="px-4">
      <h2 className="mt-5 text-xl font-bold text-left">
        {!isAuthenticated ? "Welcome " : "Logged in "}
        {account?.name ?? account?.anchor ?? ""}
      </h2>
      <Button
        primary
        className="w-full mt-4"
        onClick={!isAuthenticated ? () => login() : () => logout()}
      >
        {!isAuthenticated ? "Log in" : "Log out"}
      </Button>
    </div>
  )
}
