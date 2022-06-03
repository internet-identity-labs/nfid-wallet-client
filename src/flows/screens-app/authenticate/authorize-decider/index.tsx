import React from "react"

import { useMultipass } from "frontend/hooks/use-multipass"
import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { AuthorizeDecider } from "frontend/screens/authorize-decider"

interface AuthorizeDeciderProps {
  pathRemoteAuthorization: string
  pathSameDeviceAuthorization: string
}

export const AppScreenAuthorizeDecider: React.FC<AuthorizeDeciderProps> = ({
  pathRemoteAuthorization,
  pathSameDeviceAuthorization,
}) => {
  const { applicationName, applicationLogo } = useMultipass()

  const { navigateFactory: navigate } = useNFIDNavigate()
  return (
    <AuthorizeDecider
      applicationName={applicationName}
      applicationLogo={applicationLogo}
      onSelectRemoteAuthorization={navigate(pathRemoteAuthorization)}
      onSelectSameDeviceAuthorization={navigate(pathSameDeviceAuthorization)}
    />
  )
}
