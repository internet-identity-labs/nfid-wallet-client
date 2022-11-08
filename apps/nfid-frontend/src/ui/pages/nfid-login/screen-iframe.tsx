import React from "react"

import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { NFIDLogin } from "frontend/ui/pages/nfid-login"
import { IFrameScreen } from "frontend/ui/templates/IFrameScreen"

interface IFrameAuthenticateNFIDLoginProps
  extends React.HTMLAttributes<HTMLDivElement> {
  loginSuccessPath?: string
}

export const IFrameNFIDLogin: React.FC<IFrameAuthenticateNFIDLoginProps> = ({
  loginSuccessPath,
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
