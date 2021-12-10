import React from "react"
import clsx from "clsx"
import { Loader } from "@identitylabs/ui"
import { useNavigate, useParams } from "react-router-dom"
import { useRegisterDevicePromt } from "./hooks"
import { SetupTouchId } from "@identitylabs/ui"
import { LoginTemporarily } from "@identitylabs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardTitle } from "@identitylabs/ui"
import { CardAction } from "@identitylabs/ui"
import { Card } from "@identitylabs/ui"

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  const { secret, scope } = useParams()
  const navigate = useNavigate()
  const { remoteLogin, sendWaitForUserInput } = useRegisterDevicePromt()

  const handleLogin = React.useCallback(async () => {
    setStatus("loading")
    await remoteLogin({ secret, scope })
    return navigate(`/rdp/success`)
  }, [navigate, remoteLogin, secret, scope])

  const handleLoginAndRegister = React.useCallback(async () => {
    setStatus("loading")
    await remoteLogin({ secret, scope, register: true })
    setStatus("success")
    return navigate(`/register-confirmation/${secret}`)
  }, [navigate, remoteLogin, scope, secret])

  React.useEffect(() => {
    secret && sendWaitForUserInput(secret)
  }, [secret, sendWaitForUserInput])

  return (
    <AppScreen>
      <Card className="h-full flex flex-col">
        {status === "error" && <CardTitle>Something went wrong</CardTitle>}
        {(status === "initial" || status === "loading") && (
          <>
            <CardTitle>How to proceed?</CardTitle>
            <Loader isLoading={status === "loading"} />
            <CardAction bottom className="justify-center">
              <LoginTemporarily onClick={handleLogin} />
              <SetupTouchId onClick={handleLoginAndRegister} />
            </CardAction>
          </>
        )}
      </Card>
    </AppScreen>
  )
}
