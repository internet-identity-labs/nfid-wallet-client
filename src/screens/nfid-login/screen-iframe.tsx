import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { NFIDLogin } from "frontend/screens/nfid-login"
import { LoginSuccess } from "frontend/services/internet-identity/api-result-to-login-result"

interface IFrameAuthenticateNFIDLoginProps
  extends React.HTMLAttributes<HTMLDivElement> {
  loginSuccessPath?: string
  onLoginSuccess?: (loginResult: void | LoginSuccess) => void
}

export const IFrameNFIDLogin: React.FC<IFrameAuthenticateNFIDLoginProps> = ({
  loginSuccessPath,
  onLoginSuccess,
}) => (
  <IFrameScreen logo>
    <div className="flex flex-col-reverse">
      <NFIDLogin
        iframe
        onLoginSuccess={onLoginSuccess}
        loginSuccessPath={loginSuccessPath}
      />
    </div>
  </IFrameScreen>
)
