import { Card, CardAction, CardTitle, Loader } from "frontend/ui-kit/src/index"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { RegisterConstants as RC } from "../register/routes"
import { useRegisterDevicePromt } from "./hooks"
import { RegisterDevicePromptConstants as RDPC } from "./routes"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { NFIDPersonas } from "frontend/services/identity-manager/persona/components/nfid-persona"
import { IIPersonaList } from "frontend/services/identity-manager/persona/components/ii-persona-list"
import { useAuthorization } from "../iframes/nfid-login/hooks"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  const { secret, scope } = useParams()
  // TODO: pass applicationName through QRCode?
  const applicationName = "{applicationName}"

  const { userNumber } = useAccount()
  const navigate = useNavigate()
  const { remoteLogin, sendWaitForUserInput } = useRegisterDevicePromt()
  const { authorizeApp } = useAuthorization({
    userNumber,
  })
  const { nextPersonaId, nfidPersonas, iiPersonas, createPersona } =
    usePersona()

  console.log(">> RegisterDevicePrompt", { nfidPersonas, iiPersonas })

  const handleAuthorizePersona = React.useCallback(
    ({ persona_id, anchor }: { persona_id?: string; anchor?: string }) =>
      async () => {
        setStatus("loading")
        if (!secret || !scope || !persona_id)
          throw new Error("missing secret, scope or persona_id")
        await remoteLogin({ secret, scope, persona_id })
        return navigate(`${RDPC.base}/${RDPC.success}`)
      },
    [navigate, remoteLogin, secret, scope],
  )

  const handleCreatePersonaAndLogin = React.useCallback(async () => {
    setStatus("loading")
    console.log(">> handleCreatePersonaAndLogin", { scope })

    const response = await createPersona({ domain: scope })
    console.log(">> handleCreatePersonaAndLogin", { response })

    if (response?.status_code === 200) {
      handleAuthorizePersona({ persona_id: nextPersonaId })
    }
    console.error(">> handleCreatePersonaAndLogin", { response })
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
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        {status === "error" && <CardTitle>Something went wrong</CardTitle>}
        {(status === "initial" || status === "loading") && (
          <>
            <CardTitle>Sign in to {applicationName}</CardTitle>
            <CardAction bottom className="justify-center">
              <NFIDPersonas
                personas={nfidPersonas}
                onClickPersona={handleAuthorizePersona}
                onClickCreatePersona={handleCreatePersonaAndLogin}
              />
              <IIPersonaList
                personas={iiPersonas}
                onClickPersona={handleAuthorizeIIPersona}
              />
            </CardAction>
          </>
        )}
      </Card>
      <Loader isLoading={status === "loading"} />
    </AppScreen>
  )
}
