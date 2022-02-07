import React from "react"
import { useAuthorization } from "../nfid-login/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { H5, List, ListItem, Loader } from "frontend/ui-kit/src"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { NFIDPersonas } from "frontend/services/identity-manager/persona/components/nfid-persona"
import { IIPersonaList } from "frontend/services/identity-manager/persona/components/ii-persona-list"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { userNumber, account } = useAccount()
  const { nfidPersonas, createPersona } = usePersona()

  const { authorizationRequest, authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, iiPersonas } = usePersona({
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
        await authorizeApp({ anchor })
        setIsloading(false)
      },
    [authorizeApp, setIsloading],
  )

  const anchors =
    iiPersonas.length > 0
      ? iiPersonas
      : [{ anchor: "12890323" }, { anchor: "1819231" }, { anchor: "2813943" }]

  return (
    <IFrameScreen>
      <H5 className="mb-4 text-center">
        {account && `Welcome ${account.name}`}
      </H5>
      <NFIDPersonas
        personas={nfidPersonas}
        onClickPersona={handleAuthorizePersona}
        onClickCreatePersona={handleCreatePersona}
      />
      <IIPersonaList
        personas={iiPersonas}
        onClickPersona={handleAuthorizeIIPersona}
      />
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
