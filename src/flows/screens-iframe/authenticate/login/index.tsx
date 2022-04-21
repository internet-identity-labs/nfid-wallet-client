import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { NFIDLogin } from "frontend/screens/nfid-login"

interface IFrameAuthenticateNFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameNFIDLogin: React.FC<IFrameAuthenticateNFIDLoginProps> = () => (
  <IFrameScreen logo>
    <div className="flex flex-col-reverse">
      <NFIDLogin iframe />
    </div>
  </IFrameScreen>
)
