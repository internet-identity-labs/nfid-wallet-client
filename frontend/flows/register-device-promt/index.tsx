import React from "react"
import clsx from "clsx"
import { Button } from "frontend/ui-utils/atoms/button"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { useParams } from "react-router-dom"
import { useRegisterDevicePromt } from "./hooks"

interface RegisterDevicePromptProps {}

export const RegisterDevicePrompt: React.FC<RegisterDevicePromptProps> = () => {
  const [status, setStatus] = React.useState<
    "initial" | "loading" | "success" | "error"
  >("initial")
  let { secret, scope } = useParams<{ secret: string; scope: string }>()
  const { login } = useRegisterDevicePromt()

  const handleLogin = React.useCallback(async () => {
    setStatus("loading")
    const response = await login(secret, scope)
    if (response.status_code === 200) {
      return setStatus("success")
    }
    setStatus("error")
  }, [login, secret, scope])

  const notImplemented = React.useCallback(() => {
    console.warn("Not yet implemented")
  }, [])

  return (
    <div className={clsx("p-4 py-10 flex flex-col h-4/5")}>
      <h1 className={clsx("text-center font-bold text-3xl")}>
        Go Password-less?
      </h1>
      {status === "success" && (
        <div className="flex flex-col items-center">Success</div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center">Something went wrong</div>
      )}
      {(status === "initial" || status === "loading") && (
        <>
          {/* <div>Is this your MacBook Pro?</div>
        <div className={clsx("pt-3 flex flex-row space-x-3")}>
          <Button onClick={notImplemented}>Yes</Button>
          <Button onClick={notImplemented}>No</Button>
        </div>
        <div>
          Does anyone else have the password or registred with Touch ID on this
          computer?
        </div>
        <div className={clsx("pt-3 flex flex-row space-x-3")}>
          <Button onClick={notImplemented}>Yes</Button>
          <Button onClick={notImplemented}>No</Button>
        </div> */}
          <div className={clsx("flex-grow")} />
          <p>
            Do you want to stop using usernames and passwords to register and
            log in to supported websites and applications while using Safari on
            your Mackbook Pro?
          </p>
          <div className={clsx("pt-3 flex flex-row space-x-3 justify-center")}>
            <Button onClick={handleLogin}>Yes</Button>
            <Button onClick={notImplemented}>No</Button>
          </div>
          <Loader isLoading={status === "loading"} />
        </>
      )}
    </div>
  )
}
