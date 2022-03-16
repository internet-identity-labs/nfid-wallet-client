import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { CredentialRequesterPhonenumber } from "frontend/screens/credential-requester/phonenumber/phonenumber"
import React from "react"

interface IFrameCredentialRequesterPhonenumberProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameCredentialRequesterPhonenumber: React.FC<
  IFrameCredentialRequesterPhonenumberProps
> = ({ children, className }) => {
  return (
    <IFrameScreen logo>
      <CredentialRequesterPhonenumber
        iframe
        onPresent={() => {
          console.log("present")
        }}
        onSkip={() => {
          console.log("skip")
        }}
      />
    </IFrameScreen>
  )
}
