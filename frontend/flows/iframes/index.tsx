import { useMultipass } from "frontend/hooks/use-multipass"
import { getUserNumber } from "frontend/utils/internet-identity/userNumber"
import React from "react"
import { Route, Routes } from "react-router-dom"
import { Authenticate } from "./authenticate"
import { UnknownDeviceScreen } from "./login-unknown"

export const IFrameRoutes = () => {
  const { account, persona } = useMultipass()

  const userNumber = React.useMemo(
    () => getUserNumber(persona ? persona.anchor : null),
    [persona],
  )
  console.log(">> App", { account })
  console.log("userNumber :>> ", userNumber)
  
  return (
    <Routes>
      <Route path="/login-unknown-device" element={<UnknownDeviceScreen />} />
      <Route
        path="/authenticate"
        element={
          userNumber ? (
            <Authenticate userNumber={userNumber} />
          ) : (
            <UnknownDeviceScreen />
          )
        }
      />
    </Routes>
  )
}
