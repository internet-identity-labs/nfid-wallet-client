import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { AuthenticateNFIDLoginContent } from "frontend/screens/nfid-login"

interface IFrameAuthenticateNFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameAuthenticateNFIDLogin: React.FC<
  IFrameAuthenticateNFIDLoginProps
> = ({ children, className }) => {
  return (
    <IFrameScreen logo>
      <div className="flex flex-col-reverse">
        <AuthenticateNFIDLoginContent iframe />
      </div>
    </IFrameScreen>
  )
}
