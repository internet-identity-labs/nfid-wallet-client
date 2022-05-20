import React from "react"
import { useParams } from "react-router-dom"

import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

interface IFrameAuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IFrameAuthorizeApp: React.FC<IFrameAuthorizeAppProps> = () => {
  const { readAccount, userNumber } = useAccount()
  const { nextPersonaId, nfidPersonas, createPersona } = usePersona()
  const { identityManager } = useAuthentication()
  const { applicationName } = useMultipass()
  const { scope } = useParams()
  const { authorizeApp, opener, authorizationRequest, postClientReadyMessage } =
    useAuthorization({
      userNumber,
    })

  React.useEffect(() => {
    if (!authorizationRequest && opener) {
      return postClientReadyMessage()
    }
  }, [authorizationRequest, opener, postClientReadyMessage])

  React.useEffect(() => {
    if (userNumber && identityManager) {
      readAccount()
    }
  }, [identityManager, readAccount, userNumber])

  const handleLogin = React.useCallback(
    async (personaId: string) => {
      await authorizeApp({ persona_id: personaId })
    },
    [authorizeApp],
  )

  const handleCreateAccountAndLogin = React.useCallback(async () => {
    const response = await createPersona({
      domain: scope || authorizationRequest?.hostname,
    })

    if (response?.status_code === 200) {
      return handleLogin(nextPersonaId)
    }
  }, [
    authorizationRequest?.hostname,
    createPersona,
    handleLogin,
    nextPersonaId,
    scope,
  ])

  return (
    <IFrameScreen logo>
      <AuthorizeApp
        accounts={nfidPersonas}
        applicationName={applicationName || ""}
        onLogin={handleLogin}
        onCreateAccount={handleCreateAccountAndLogin}
      />
    </IFrameScreen>
  )
}
