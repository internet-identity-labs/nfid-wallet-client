import React from "react"

import { NFIDLogin } from "frontend/design-system/pages/nfid-login"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

interface IFrameAuthenticateNFIDLoginProps
  extends React.HTMLAttributes<HTMLDivElement> {
  loginSuccessPath?: string
}

export const IFrameNFIDLogin: React.FC<IFrameAuthenticateNFIDLoginProps> = ({
  loginSuccessPath,
}) => (
  <IFrameScreen logo>
    <div className="flex flex-col-reverse">
      <NFIDLogin iframe loginSuccessPath={loginSuccessPath} />
    </div>
  </IFrameScreen>
)
