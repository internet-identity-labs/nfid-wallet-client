import { useMultipass } from "frontend/hooks/use-multipass"
import { getUserNumber } from "frontend/services/internet-identity/userNumber"
import React from "react"
import { Authenticate } from "."
import { UnknownDeviceScreen } from "../login-unknown"

export const AuthenticateConstants = {
  base: "/authenticate",
}

const AuthenticateDecider: React.FC = () => {
  const { account } = useMultipass()

  const userNumber = React.useMemo(
    () => getUserNumber(account ? account.rootAnchor : null),
    [account],
  )

  console.log(">> AuthenticateDecider", { account, userNumber })

  return userNumber ? (
    <Authenticate userNumber={userNumber} />
  ) : (
    <UnknownDeviceScreen />
  )
}

export const AuthenticateRoutes = {
  path: AuthenticateConstants.base,
  element: <AuthenticateDecider />,
}
