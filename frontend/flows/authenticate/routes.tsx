import { useMultipass } from "frontend/hooks/use-multipass"
import { getUserNumber } from "frontend/services/internet-identity/userNumber"
import React from "react"
import { Authenticate } from "."
import { UnknownDeviceScreen } from "../iframes/login-unknown"

export const AuthenticateConstants = {
  base: "/authenticate",
}

const AuthenticateDecider: React.FC = () => {
  const { persona } = useMultipass()

  const userNumber = React.useMemo(
    () => getUserNumber(persona ? persona.anchor : null),
    [persona],
  )

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
