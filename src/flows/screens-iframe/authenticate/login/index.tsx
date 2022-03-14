import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { NFIDLogin } from "frontend/screens/nfid-login"
import React from "react"

interface IFrameAuthenticateNFIDLoginProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameNFIDLogin: React.FC<
  IFrameAuthenticateNFIDLoginProps
> = ({ children, className }) => {
  return (
    <IFrameScreen logo>
      <div className="flex flex-col-reverse">
        <NFIDLogin iframe />
      </div>
    </IFrameScreen>
  )
}
