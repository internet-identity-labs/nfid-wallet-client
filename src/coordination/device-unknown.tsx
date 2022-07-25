import { useActor } from "@xstate/react"
import React from "react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { RemoteReceiverActor } from "frontend/state/machines/authentication/remote-receiver"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"
import { UnknownDeviceActor } from "frontend/state/machines/authentication/unknown-device"
import { AuthorizeDecider } from "frontend/ui/pages/authorize-decider"

import { RegistrationCoordinator } from "./registration"
import { RemoteReceiverCoordinator } from "./remote-receiver"
import { TrustDeviceCoordinator } from "./trust-device"

export function UnknownDeviceCoordinator({ actor }: Actor<UnknownDeviceActor>) {
  const [state, send] = useActor(actor)

  React.useEffect(
    () =>
      console.debug("UnknownDeviceCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("ExistingAnchor"):
    case state.matches("AuthSelection"):
    case state.matches("AuthWithGoogle"):
      return (
        <AuthorizeDecider
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          onSelectRemoteAuthorization={() => send("AUTH_WITH_REMOTE")}
          onSelectSameDeviceRegistration={() =>
            console.log("VOID: SAME DEVICE")
          }
          onSelectSameDeviceAuthorization={() =>
            console.log("VOID: SAME DEVICE AUTHO")
          }
          onSelectGoogleAuthorization={({ credential }) =>
            send({ type: "AUTH_WITH_GOOGLE", data: credential as string })
          }
          onSelectSecurityKeyAuthorization={() =>
            console.log("VOID: SECURITY KEY")
          }
          onToggleAdvancedOptions={() => send("AUTH_WITH_OTHER")}
          showAdvancedOptions={state.matches("ExistingAnchor")}
          isLoading={state.matches("AuthWithGoogle")}
        />
      )
    case state.matches("RegistrationMachine"):
      return (
        <RegistrationCoordinator
          actor={state.children.registration as RegistrationActor}
        />
      )
    case state.matches("RemoteAuthentication"):
      return (
        <RemoteReceiverCoordinator
          actor={state.children.remote as RemoteReceiverActor}
        />
      )
    case state.matches("TrustDevice"):
      return (
        <TrustDeviceCoordinator
          actor={state.children.trustDeviceMachine as TrustDeviceActor}
        />
      )
    case state.matches("End"):
    case state.matches("Start"):
    default:
      return <Loader isLoading={true} />
  }
}
