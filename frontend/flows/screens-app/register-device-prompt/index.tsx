import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { IIPersonaList } from "frontend/services/identity-manager/persona/components/ii-persona-list"
import { NFIDPersonas } from "frontend/services/identity-manager/persona/components/nfid-persona"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { Button, Card, CardBody, H2, Loader } from "frontend/ui-kit/src/index"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuthorization } from "../../screens-iframe/nfid-login/hooks"
import { ProfileConstants } from "../profile/routes"
import { useRegisterDevicePromt } from "./hooks"

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  const { secret, scope } = useParams()
  const { applicationName } = useMultipass()

  const { userNumber } = useAccount()
  const navigate = useNavigate()
  const { remoteLogin, sendWaitForUserInput } = useRegisterDevicePromt()
  const { authorizeApp } = useAuthorization({
    userNumber,
  })
  const { nextPersonaId, nfidPersonas, iiPersonas, createPersona } =
    usePersona()

  const handleAuthorizePersona = React.useCallback(
    ({ persona_id }: { persona_id?: string; anchor?: string }) =>
      async () => {
        setStatus("loading")
        if (!secret || !scope || !persona_id)
          throw new Error("missing secret, scope or persona_id")
        await remoteLogin({ secret, scope, persona_id })
        return navigate(`${ProfileConstants.authenticate}`)
      },
    [navigate, remoteLogin, secret, scope],
  )

  const handleCreatePersonaAndLogin = React.useCallback(async () => {
    setStatus("loading")

    const response = await createPersona({ domain: scope })

    if (response?.status_code === 200) {
      return handleAuthorizePersona({ persona_id: nextPersonaId })()
    }
  }, [createPersona, handleAuthorizePersona, nextPersonaId, scope])

  const handleAuthorizeIIPersona = React.useCallback(
    ({ anchor }) =>
      async () => {
        setStatus("loading")
        await authorizeApp({ anchor })
        setStatus("success")
      },
    [authorizeApp],
  )

  React.useEffect(() => {
    secret && sendWaitForUserInput(secret)
  }, [secret, sendWaitForUserInput])

  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-10 lg:col-span-8">
          {status === "error" && <H2>Something went wrong</H2>}

          {(status === "initial" || status === "loading") && (
            <div>
              <H2 className="mb-4">Sign in to {applicationName}</H2>

              <div className="max-w-md">
                <NFIDPersonas
                  personas={nfidPersonas}
                  onClickPersona={handleAuthorizePersona}
                  onClickCreatePersona={handleCreatePersonaAndLogin}
                />

                <IIPersonaList
                  personas={iiPersonas}
                  onClickPersona={handleAuthorizeIIPersona}
                />

                <Button stroke block className="mt-3">
                  Link new Internet Identity Anchor
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
      <Loader isLoading={status === "loading"} />
    </AppScreen>
  )
}
