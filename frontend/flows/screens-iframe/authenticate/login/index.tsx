import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { AuthenticateNFIDLoginContent } from "frontend/flows/screens-app/authenticate/login/content"
import React from "react"

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
