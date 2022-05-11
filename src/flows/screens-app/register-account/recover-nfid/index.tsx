import React from "react"

import { RecoverNFID } from "frontend/screens/recover-nfid"

interface RouteRecoverNFIDProps {
  registerDeviceDeciderPath: string
}

export const RouteRecoverNFID: React.FC<RouteRecoverNFIDProps> = ({
  registerDeviceDeciderPath,
}) => {
  return <RecoverNFID registerDeviceDeciderPath={registerDeviceDeciderPath} />
}
