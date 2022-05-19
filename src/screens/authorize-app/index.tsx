import { Button } from "@internet-identity-labs/nfid-sdk-react"
import { H2, H5 } from "@internet-identity-labs/nfid-sdk-react"
import { DropdownMenu } from "@internet-identity-labs/nfid-sdk-react"
import { Label, Loader, MenuItem } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { ProfileConstants } from "frontend/flows/screens-app/profile/routes"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useAuthorizeApp } from "frontend/hooks/use-authorize-app"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { ElementProps } from "frontend/types/react"

interface AuthorizeAppProps extends ElementProps<HTMLDivElement> {
  isRemoteAuthorisation?: boolean
}

export const AuthorizeApp: React.FC<AuthorizeAppProps> = ({
  isRemoteAuthorisation,
}) => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("loading")
  const { secret, scope } = useParams()
  const { applicationName } = useMultipass()

  const { userNumber } = useAccount()
  const navigate = useNavigate()
  const { remoteLogin, sendWaitForUserInput } = useAuthorizeApp()

  const { opener, postClientReadyMessage, authorizeApp, authorizationRequest } =
    useAuthorization({
      userNumber,
    })

  React.useEffect(() => {
    if (!authorizationRequest && opener) {
      return postClientReadyMessage()
    }
    setStatus("initial")
  }, [authorizationRequest, opener, postClientReadyMessage])

  const { nextPersonaId, nfidPersonas, createPersona } = usePersona()

  const hasNFIDPersonas = nfidPersonas.length > 0

  React.useEffect(() => {
    secret && sendWaitForUserInput(secret)
  }, [secret, sendWaitForUserInput])

  const [selectedItem, setSelectedItem] = React.useState<string>(
    String(nfidPersonas[0]?.persona_id),
  )

  const handleAuthorizePersona = React.useCallback(
    ({ persona_id }: { persona_id?: string; anchor?: string }) =>
      async () => {
        setStatus("loading")

        if (!isRemoteAuthorisation && persona_id) {
          await authorizeApp({ persona_id })
          return setStatus("success")
        }

        if (!secret || !scope || !persona_id)
          throw new Error("missing secret, scope or persona_id")

        await remoteLogin({ secret, scope, persona_id })

        return navigate(
          `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
        )
      },
    [isRemoteAuthorisation, secret, scope, remoteLogin, navigate, authorizeApp],
  )

  const handleCreatePersonaAndLogin = React.useCallback(async () => {
    setStatus("loading")

    const response = await createPersona({
      domain: scope || authorizationRequest?.hostname,
    })

    if (response?.status_code === 200) {
      return handleAuthorizePersona({ persona_id: nextPersonaId })()
    }
  }, [
    authorizationRequest?.hostname,
    createPersona,
    handleAuthorizePersona,
    nextPersonaId,
    scope,
  ])

  const handleLogin = React.useCallback(async () => {
    if (selectedItem) {
      await handleAuthorizePersona({
        persona_id: selectedItem,
      })()
    }
  }, [handleAuthorizePersona, selectedItem])

  const title = `Log in to ${applicationName}`

  return status === "initial" || status === "loading" ? (
    <div>
      {isRemoteAuthorisation ? (
        <H5 className="mb-4">{title}</H5>
      ) : (
        <H2 className="mb-4">{title}</H2>
      )}

      <div>
        {hasNFIDPersonas && (
          <>
            <Label>Continue as</Label>
            <DropdownMenu title={selectedItem}>
              {(toggle) => (
                <div className="h-40 overflow-y-auto">
                  <Label menuItem>Personas</Label>
                  {nfidPersonas.map((persona, index) => (
                    <MenuItem
                      key={index}
                      title={`${applicationName} account ${persona.persona_id}`}
                      onClick={() => {
                        setSelectedItem(String(persona.persona_id))
                        toggle()
                      }}
                    />
                  ))}
                </div>
              )}
            </DropdownMenu>
            <Button secondary block onClick={handleLogin}>
              Log in
            </Button>
          </>
        )}
      </div>
      <Button
        text={hasNFIDPersonas ? true : false}
        secondary={hasNFIDPersonas ? false : true}
        block
        onClick={handleCreatePersonaAndLogin}
      >
        Create a new account
      </Button>

      {/* Disabled for first version */}
      {/* <LinkIIAnchorHref onClick={handleIILink} /> */}
      <Loader isLoading={status === "loading"} iframe={isRemoteAuthorisation} />
    </div>
  ) : null
}
