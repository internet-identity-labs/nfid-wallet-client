import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface IFrameAuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameAuthorizeApp: React.FC<IFrameAuthorizeAppProps> = () => {
  const { readAccount, userNumber } = useAccount()
  const { identityManager } = useAuthentication()

  React.useEffect(() => {
    if (userNumber && identityManager) {
      readAccount(identityManager, userNumber)
    }
  }, [identityManager, readAccount, userNumber])

  return (
    <IFrameScreen logo>
      <AuthorizeApp isRemoteAuthorisation />
    </IFrameScreen>
  )
}
