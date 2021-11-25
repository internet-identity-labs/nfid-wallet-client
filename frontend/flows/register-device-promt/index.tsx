import React from "react"
import clsx from "clsx"
import { Button } from "frontend/ui-utils/atoms/button"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { useHistory, useParams } from "react-router-dom"
import { useRegisterDevicePromt } from "./hooks"
import { Screen } from "frontend/ui-utils/atoms/screen"
import { TouchId } from "frontend/ui-utils/atoms/icons/touch-id"
import { TemporarId } from "frontend/ui-utils/atoms/icons/temporar-id"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { SetupTouchId } from "frontend/ui-utils/molecules/setup-touch-id"

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
    <Screen>
      {status === "success" && (
        <Centered>
          <div className="flex flex-col items-center">Success</div>
        </Centered>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">Something went wrong</div>
      )}
      {(status === "initial" || status === "loading") && (
        <>
          <h1 className={clsx("font-bold text-3xl")}>Multipass</h1>
          <div className={clsx("flex-grow")} />
          <p className="font-medium text-center my-5">
            How would you like to proceed?
          </p>
          <div className={clsx("pt-3 flex flex-col space-y-1 justify-center")}>
            <Button
              onClick={handleLogin}
              className={clsx(
                "flex flex-row w-full justify-start items-center",
              )}
            >
              <div className={clsx("p-2 bg-gray-200")}>
                <TemporarId />
              </div>
              <div className="ml-1 p-2 align-middle">Log me in temporarily</div>
            </Button>
            <SetupTouchId onClick={handleLoginAndRegister} />
          </div>
          <Loader isLoading={status === "loading"} />
        </>
      )}
    </Screen>
  )
}
