import React from "react"
import { useAuthorization } from "../nfid-login/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { Button } from "frontend/ui-kit/src/components/atoms/button"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { H5, List, ListItem, Loader } from "frontend/ui-kit/src"
import { useIsLoading } from "frontend/hooks/use-is-loading"

interface AuthorizeAppProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = () => {
  const { isLoading, setIsloading } = useIsLoading()
  const { userNumber, account } = useAccount()
  const { createPersona } = usePersona()

  const { authorizationRequest, authorizeApp } = useAuthorization({
    userNumber,
  })

  const { nextPersonaId, nfidPersonas, iiPersonas } = usePersona({
    application: authorizationRequest?.hostname,
  })

  const handleCreatePersona = React.useCallback(
    ({ domain }) =>
      async () => {
        setIsloading(true)
        await createPersona({ domain })
        await authorizeApp({ persona_id: nextPersonaId })
        setIsloading(false)
      },
    [authorizeApp, createPersona, nextPersonaId, setIsloading],
  )

  const handleAuthorizePersona = React.useCallback(
    ({ persona_id }) =>
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

      <div>
        {nfidPersonas?.map(({ persona_id }) => (
          <Button
            key={persona_id}
            block
            secondary
            onClick={handleAuthorizePersona({ persona_id })}
            className="mt-1"
          >
            Continue as NFID persona {persona_id}
          </Button>
        ))}
        <Button
          block
          stroke
          color="white"
          onClick={handleCreatePersona({
            domain: authorizationRequest?.hostname,
          })}
          className="mt-1"
        >
          Create new persona
        </Button>
      </div>

      <div>
        {/* TODO: make dynamic */}
        <List>
          {anchors.length > 1 && (
            <List.Header>
              <div className="text-base text-center py-5">
                We have found several anchors. Choose with which one you want to
                continue:
              </div>
            </List.Header>
          )}
          <List.Items>
            {anchors.map(({ anchor }, index) => (
              <ListItem
                key={index}
                title={anchor}
                onClick={() => handleAuthorizeIIPersona({ anchor })}
              />
            ))}
          </List.Items>
        </List>
      </div>

      <Button stroke block className="mt-2">
        Link new Internet Identity Anchor
      </Button>
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
