import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { TouchId } from "frontend/ui-utils/atoms/icons/touch-id"
import { Loader } from "frontend/ui-utils/atoms/loader"
import React from "react"

const useAuthentication = () => {
  const [isLoading, setLoading] = React.useState(false)
  const READY_MESSAGE = {
    kind: "authorize-ready",
  };

  const handleAuthMessage = React.useCallback(async (event) => {
    const message = event.data;
    if (message.kind === "authorize-client") {
      console.log(">> Handling authorize-client request.");
      // const response = await handleAuthRequest(
      //   connection,
      //   userNumber,
      //   message,
      //   event.origin
      // );
      // (event.source as Window).postMessage(response, event.origin);
    }
  }, [])

  const greetAuthClient = React.useCallback((opener) => {
    opener.postMessage(READY_MESSAGE, "*")
  }, [])

  const login = React.useCallback(async () => {
    setLoading(true)
    console.log('>> tryLogin', { canisterId: process.env.II_CANISTER_ID });
    const response = await IIConnection.login(BigInt(10000))
    console.log('>> ', { response });
    setLoading(false)
  }, [])

  React.useEffect(() => {
    window.addEventListener("message", handleAuthMessage)
    return () => window.removeEventListener("message", handleAuthMessage)
  }, [])

  React.useEffect(() => {
    let interval: NodeJS.Timer

    interval = setInterval(() => {
      if (window.opener !== null) {
        greetAuthClient(window.opener)
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  })

  React.useEffect(() => {
    console.log('>> ', { opener: window.opener });

    if (window.opener !== null) {
      window.opener.postMessage(READY_MESSAGE, "*");
    }
  }, [window.opener])
  return { isLoading, login }
}

export const Authenticate: React.FC = () => {
  const scope = "DSCVR"

  const { isLoading, login } = useAuthentication()


  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      <div className="flex items-center" onClick={login}>
        <TouchId />
        <div className="ml-1">Continue with TouchID as Philipp</div>
      </div>
      <Loader isLoading={isLoading} />
    </Centered>
  )
}
