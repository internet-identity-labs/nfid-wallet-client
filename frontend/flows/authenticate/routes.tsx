import { useMultipass } from "frontend/hooks/use-multipass"
import { getUserNumber } from "frontend/utils/internet-identity/userNumber"
import React from "react"
import { Authenticate } from "."
import { UnknownDeviceScreen } from "../iframes/login-unknown"

export const CONSTANTS = {
  base: "authenticate",
}

export const AuthenticateRoutes = () => {
  const { persona } = useMultipass()

  const userNumber = React.useMemo(
    () => getUserNumber(persona ? persona.anchor : null),
    [persona],
  )

  return {
    path: CONSTANTS.base,
    element: userNumber ? (
      <Authenticate userNumber={userNumber} />
    ) : (
      <UnknownDeviceScreen />
    ),
  }
}
