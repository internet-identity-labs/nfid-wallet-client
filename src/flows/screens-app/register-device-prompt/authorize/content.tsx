import clsx from "clsx"
import { Button } from "components/atoms/button"
import { H2, H5 } from "components/atoms/typography"
import { DropdownMenu } from "components/molecules/menu"
import { useAuthorization } from "frontend/flows/screens-iframe/authenticate/login/hooks"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { Label, Loader, MenuItem } from "frontend/ui-kit/src"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ProfileConstants } from "../../profile/routes"
import { useRegisterDevicePromt } from "../hooks"

interface AuthorizeAppContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const AuthorizeAppContent: React.FC<AuthorizeAppContentProps> = ({
  iframe = false,
}) => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("loading")
  const { secret, scope } = useParams()
  const { applicationName } = useMultipass()

  const { userNumber } = useAccount()
  const navigate = useNavigate()
  const { remoteLogin, sendWaitForUserInput } = useRegisterDevicePromt()

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

  const { nextPersonaId, nfidPersonas, iiPersonas, createPersona } =
    usePersona()

  const hasNFIDPersonas = nfidPersonas.length > 0

  React.useEffect(() => {
    secret && sendWaitForUserInput(secret)
  }, [secret, sendWaitForUserInput])

  const [selectedItem, setSelectedItem] = React.useState<string>(
    nfidPersonas[0]?.persona_id,
  )
  const [isPersonaSelected, setIsPersonaSelected] = React.useState(true)

  const handleAuthorizePersona = React.useCallback(
    ({ persona_id }: { persona_id?: string; anchor?: string }) =>
      async () => {
        setStatus("loading")

        if (iframe && persona_id) {
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
    [iframe, secret, scope, remoteLogin, navigate, authorizeApp],
  )

  const handleAuthorizeIIPersona = React.useCallback(
    ({ anchor }) =>
      async () => {
        setStatus("loading")
        await authorizeApp({ anchor })
        setStatus("success")
      },
    [authorizeApp],
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
    if (isPersonaSelected) {
      await handleAuthorizePersona({
        persona_id: selectedItem,
      })()
    }

    if (!isPersonaSelected) {
      await handleAuthorizeIIPersona({
        anchor: selectedItem,
      })()
    }
  }, [
    handleAuthorizeIIPersona,
    handleAuthorizePersona,
    isPersonaSelected,
    selectedItem,
  ])

  const title = `Log in to ${applicationName || "NFID Demo"}`

  return status === "initial" || status === "loading" ? (
    <div>
      {iframe ? (
        <H5 className="mb-4">{title}</H5>
      ) : (
        <H2 className="mb-4">{title}</H2>
      )}

      <div className="mb-5">
        {hasNFIDPersonas && (
          <>
            <Label>Continue as</Label>
            <DropdownMenu title={selectedItem}>
              {(toggle) => (
                <>
                  <Label menuItem>Personas</Label>
                  {nfidPersonas.map((persona, index) => (
                    <MenuItem
                      key={index}
                      title={persona.persona_id}
                      onClick={() => {
                        setSelectedItem(persona.persona_id)
                        setIsPersonaSelected(true)
                        toggle()
                      }}
                    />
                  ))}

                  <Label
                    menuItem
                    className={clsx(iiPersonas?.length === 0 && "hidden")}
                  >
                    Anchors
                  </Label>
                  {iiPersonas.map((persona, index) => (
                    <MenuItem
                      key={index}
                      title={persona.anchor}
                      onClick={() => {
                        setSelectedItem(persona.anchor)
                        setIsPersonaSelected(false)
                        toggle()
                      }}
                    />
                  ))}
                </>
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
      <Loader isLoading={status === "loading"} iframe={iframe} />
    </div>
  ) : null
}
