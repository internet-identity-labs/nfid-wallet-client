import React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@internet-identity-labs/nfid-sdk-react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { usePersona } from "frontend/integration/identity-manager/persona/hooks"

interface PopupLoginProps {}

export const PopupLogin: React.FC<PopupLoginProps> = () => {
  const { readAccount, account } = useAccount()
  const { getPersona } = usePersona()
  const { login, isAuthenticated } = useAuthentication()
  const navigate = useNavigate()

  const handleLogin = async () => {
    await login()
    await readAccount()
    await getPersona()
    // navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
  }

  React.useEffect(() => {
    if (isAuthenticated) {
      readAccount()
      getPersona()
    }
  }, [getPersona, isAuthenticated, readAccount])

  return (
    <div className="px-4 mx-auto">
      <h2 className="mt-5 text-xl font-bold text-left">
        Welcome {account?.name ?? account?.anchor ?? ""}
      </h2>
      <Button primary className="w-full mt-4" onClick={handleLogin}>
        Log in
      </Button>
    </div>
  )
}
