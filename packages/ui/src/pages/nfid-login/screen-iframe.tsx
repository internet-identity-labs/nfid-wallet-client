import React from "react"

import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { NFIDLogin } from "./nfid-login"
import { IFrameScreen } from "@nfid/ui/templates/IFrameScreen"

interface IFrameAuthenticateNFIDLoginProps extends React.HTMLAttributes<HTMLDivElement> {
  loginSuccessPath?: string
}

export const IFrameNFIDLogin: React.FC<IFrameAuthenticateNFIDLoginProps> = ({
  loginSuccessPath: _loginSuccessPath,
}) => {
  const { profile } = useAccount()

  return (
    <IFrameScreen logo>
      <div className="flex flex-col-reverse">
        <NFIDLogin iframe account={profile} />
      </div>
    </IFrameScreen>
  )
}
