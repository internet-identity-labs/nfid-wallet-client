import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { AuthorizeAppContent } from "frontend/flows/screens-app/register-device-prompt/authorize/content"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import React from "react"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = () => {
  const { readAccount } = useAccount()

  console.log(">> AuthorizeApp")

  const handleReadAccount = React.useCallback(async () => {
    const account = await readAccount()
    console.log(">> handleReadAccount", { account })
  }, [readAccount])

  React.useEffect(() => {
    handleReadAccount()
  }, [handleReadAccount])

  return (
    <IFrameScreen logo>
      <AuthorizeAppContent iframe />
    </IFrameScreen>
  )
}
