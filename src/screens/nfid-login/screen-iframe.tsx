import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"

import { NFIDLogin } from "frontend/screens/nfid-login"

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
