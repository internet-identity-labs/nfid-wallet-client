import { useActor, useMachine } from "@xstate/react"

import { remoteReceiverUrl } from "frontend/apps/authentication/remote-authentication/routes"
import { useMessages } from "frontend/integration/pubsub"
import { RemoteReceiverActor } from "frontend/state/machines/authentication/remote-receiver"
import { RemoteAuthorizeAppUnknownDevice } from "frontend/ui/pages/remote-authorize-app-unknown-device"

export function RemoteReceiverCoordinator({
  actor,
}: Actor<RemoteReceiverActor>) {
  const { messages } = useMessages()
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("QrCode"):
    case state.matches("Loading"):
      return (
        <RemoteAuthorizeAppUnknownDevice
          applicationLogo={state.context.appMeta?.logo || ""}
          applicationName={state.context.appMeta?.name || ""}
          registerDeviceDeciderPath={""}
          registerSameDevicePath={""}
          isLoading={state.matches("Loading")}
          showRegister={false}
          url={remoteReceiverUrl({
            applicationDerivationOrigin:
              state.context.authRequest?.derivationOrigin,
            domain: "", // what goes here?
            secret: state.context.secret,
            applicationName: state.context.appMeta?.name,
            applicationLogo: state.context.appMeta?.logo,
          })}
        />
      )
    default:
      return <div>RegistrationCoordinator</div>
  }
}
