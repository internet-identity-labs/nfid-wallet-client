import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"

interface IFrameAuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameAuthorizeApp: React.FC<IFrameAuthorizeAppProps> = () => {
  const { userNumber, readAccount } = useAccount()
  const { identityManager } = useAuthentication()

  console.log(">> AuthorizeApp")

  React.useEffect(() => {
    if (userNumber && identityManager) {
      readAccount(identityManager, userNumber)
    }
  }, [identityManager, readAccount, userNumber])

  return (
    <IFrameScreen logo>
      <AuthorizeApp iframe />
    </IFrameScreen>
  )
}
