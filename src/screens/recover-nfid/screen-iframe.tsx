import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RecoverNFID } from "frontend/screens/recover-nfid"

interface IFrameIFrameRecoverNFIDProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onRecoverSuccessPath: string
}

export const IFrameRecoverNFID: React.FC<IFrameIFrameRecoverNFIDProps> = ({
  onRecoverSuccessPath,
}) => {
  return (
    <IFrameScreen logo>
      <RecoverNFID iframe registerDeviceDeciderPath={onRecoverSuccessPath} />
    </IFrameScreen>
  )
}
