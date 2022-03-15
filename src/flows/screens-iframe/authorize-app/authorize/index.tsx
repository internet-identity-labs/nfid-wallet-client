import React from "react"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { AuthorizeAppContent } from "frontend/flows/screens-app/register-device-prompt/authorize/content"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = () => {
  const { readAccount, userNumber } = useAccount()
  const { identityManager } = useAuthentication()

  React.useEffect(() => {
    if (userNumber && identityManager) {
      readAccount(identityManager, userNumber)
    }
  }, [identityManager, readAccount, userNumber])

  return (
    <IFrameScreen logo>
      <AuthorizeAppContent iframe />
    </IFrameScreen>
  )
}
