import { useMachine } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { useMultipass } from "frontend/apps/identity-provider/use-app-meta"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"

import { Authenticate } from "./local-authenticate"
import { machine } from "./machine"
import { RemoteAuthenticate } from "./remote-authenticate"

export const AuthenticateRouteV2: React.FC = () => {
  const { applicationLogo, applicationName } = useMultipass()
  console.log(">> ", { applicationLogo, applicationName })

  const { account } = useAccount()
  const [{ value }] = useMachine(machine, {
    actions: {
      ingestDelegate: () => {},
      ingestDevice: () => {},
    },
    guards: {
      isDeviceRegistered: () => !!account,
    },
  })
  console.log(">> AuthenticateRouteV2", { account, value })
  switch (value) {
    case "Authenticate":
      return <Authenticate />
    case "RemoteAuthenticate":
      return <RemoteAuthenticate />
    default:
      return <Loader isLoading />
  }
}
