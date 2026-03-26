import { useMachine } from "@xstate/react"
import { BlurredLoader } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "frontend/features/authentication/root/coordinator"
import { AuthenticationMachineActor } from "frontend/features/authentication/root/root-machine"
import NFIDAuthMachine from "frontend/features/authentication/nfid/nfid-machine"

export function WalletConnectAuthenticationScreen() {
  const [authState] = useMachine(NFIDAuthMachine)

  if (authState.matches("AuthenticationMachine")) {
    return (
      <AuthenticationCoordinator
        isIdentityKit
        actor={
          authState.children
            ?.AuthenticationMachine as AuthenticationMachineActor
        }
        loader={<BlurredLoader isLoading loadingMessage="Authenticating..." />}
      />
    )
  }

  return (
    <BlurredLoader isLoading loadingMessage="Initializing authentication..." />
  )
}
