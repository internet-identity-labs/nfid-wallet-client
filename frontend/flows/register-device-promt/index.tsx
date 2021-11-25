import React from "react"
import clsx from "clsx"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { useHistory, useParams } from "react-router-dom"
import { useRegisterDevicePromt } from "./hooks"
import { Screen } from "frontend/ui-utils/atoms/screen"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { SetupTouchId } from "frontend/ui-utils/molecules/setup-touch-id"
import { AuthTicket } from "frontend/ui-utils/molecules/ticket"
import { LoginTemporarily } from "frontend/ui-utils/molecules/login-temporarily"
import { Helmet } from "react-helmet"

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  const { secret, scope } = useParams<{ secret: string; scope: string }>()
  const { push } = useHistory()
  const { remoteLogin, sendWaitForUserInput } = useRegisterDevicePromt()

  const handleLogin = React.useCallback(async () => {
    setStatus("loading")
    await remoteLogin({ secret, scope })
    return setStatus("success")
  }, [remoteLogin, secret, scope])

  const handleLoginAndRegister = React.useCallback(async () => {
    setStatus("loading")
    await remoteLogin({ secret, scope, register: true })
    setStatus("success")
    return push(`/register-confirmation/${secret}`)
  }, [push, remoteLogin, scope, secret])

  React.useEffect(() => {
    secret && sendWaitForUserInput(secret)
  }, [secret, sendWaitForUserInput])

  return (
    <Screen
      className={clsx("bg-gradient-to-b from-blue-400 via-white to-white")}
    >
      <Helmet>
        <meta name="theme-color" content="#3eb3e5" />
      </Helmet>
      {status === "success" && (
        <Centered>
          <div className="flex flex-col items-center">Success</div>
        </Centered>
      )}
      {status === "error" && (
        <Centered>
          <div className="flex flex-col items-center">Something went wrong</div>
        </Centered>
      )}
      {(status === "initial" || status === "loading") && (
        <div className={clsx("p-7 py-10 flex flex-col h-full")}>
          <div className={clsx("")}>
            <h1 className={clsx("font-bold text-3xl mb-10")}>Multipass</h1>
            <AuthTicket />
          </div>
          <div className={clsx("flex-grow")} />
          <p className="font-medium text-center my-5">
            How would you like to proceed?
          </p>
          <div className={clsx("pt-3 flex flex-col space-y-1 justify-center")}>
            <LoginTemporarily onClick={handleLogin} />
            <SetupTouchId onClick={handleLoginAndRegister} />
          </div>

          <Loader isLoading={status === "loading"} />
        </div>
      )}
    </Screen>
  )
}
