import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { AuthorizeAppContent } from "frontend/flows/screens-app/register-device-prompt/authorize/content"
import { useInterval } from "frontend/hooks/use-interval"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import React from "react"
import { useAuthorization } from "../../nfid-login/hooks"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = () => {
  // TODO: clean this up to only handle handleLinkIIAnchor + (persisted) iiPersonas?
  const { isLoading, setIsloading } = useIsLoading()
  const { userNumber, account, resetLocalAccount } = useAccount()
  const { nfidPersonas, createPersona } = usePersona()
  const [pollForNewAnchor, setPollForNewAnchor] = React.useState(false)
  const [iiAnchorsBeforeLinking, setIIAnchorsBeforeLinking] = React.useState(
    account?.iiAnchors?.length ?? 0,
  )

  const { authorizationRequest, authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, iiPersonas: iiPersonasPersisted } = usePersona({
    application: authorizationRequest?.hostname,
  })

  const handleCreatePersona = React.useCallback(async () => {
    setIsloading(true)
    await createPersona({ domain: authorizationRequest?.hostname })
    await authorizeApp({ persona_id: nextPersonaId })
    setIsloading(false)
  }, [
    authorizationRequest?.hostname,
    authorizeApp,
    createPersona,
    nextPersonaId,
    setIsloading,
  ])

  const handleAuthorizePersona = React.useCallback(
    ({ persona_id }: { persona_id: string }) =>
      async () => {
        setIsloading(true)
        await authorizeApp({ persona_id })
        setIsloading(false)
      },
    [authorizeApp, setIsloading],
  )

  const handleAuthorizeIIPersona = React.useCallback(
    ({ anchor }) =>
      async () => {
        setIsloading(true)
        const loginResult = await IIConnection.login(BigInt(anchor))
        const result = apiResultToLoginResult(loginResult)

        if (result.tag === "ok") {
          await authorizeApp({
            anchor,
            internetIdentityForAnchor: result.internetIdentity,
          })
          setIsloading(false)
        }
      },
    [authorizeApp, setIsloading],
  )

  // TODO: implement after first version
  const handleLinkIIAnchor = React.useCallback(() => {
    setPollForNewAnchor(true)
    setIIAnchorsBeforeLinking(account?.iiAnchors?.length ?? 0)
  }, [account?.iiAnchors?.length])

  const iiPersonas = [
    ...iiPersonasPersisted,
    ...(account?.iiAnchors?.map((anchor) => ({ anchor })) || []),
  ]

  React.useEffect(() => {
    if (iiAnchorsBeforeLinking < (account?.iiAnchors?.length ?? 0)) {
      setPollForNewAnchor(false)
    }
  }, [account?.iiAnchors?.length, iiAnchorsBeforeLinking])

  useInterval(resetLocalAccount, 500, pollForNewAnchor)

  return (
    <IFrameScreen logo>
      <AuthorizeAppContent iframe />
    </IFrameScreen>
  )
}
