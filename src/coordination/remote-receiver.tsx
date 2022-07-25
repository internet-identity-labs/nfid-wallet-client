import { SignIdentity } from "@dfinity/agent"
import { useActor } from "@xstate/react"
import React from "react"

import { remoteReceiverUrl } from "frontend/apps/authentication/remote-authentication/routes"
import {
  fetchAuthenticatorDevices,
  getMultiIdent,
  reconstructIdentity,
} from "frontend/integration/internet-identity"
import {
  isRemoteLoginRegisterMessage,
  isWaitForConfigramtionMessage,
  RemoteLoginRegisterMessage,
  useMessages,
} from "frontend/integration/pubsub"
import { RemoteReceiverActor } from "frontend/state/machines/authentication/remote-receiver"
import { RemoteAuthorizeAppUnknownDevice } from "frontend/ui/pages/remote-authorize-app-unknown-device"

export function RemoteReceiverCoordinator({
  actor,
}: Actor<RemoteReceiverActor>) {
  const [state, send] = useActor(actor)
  // FIXME: REFACTOR THE MESSAGE HANDLING INTO MACHINE SERVICES
  const { messages } = useMessages(state.context.secret)
  console.debug(RemoteReceiverCoordinator.name, { messages })

  // FIXME: REFACTOR THE MESSAGE HANDLING INTO MACHINE SERVICES
  const handleRemoteRegister = React.useCallback(
    async (message: RemoteLoginRegisterMessage) => {
      // FIXME: Not sure if we need to reconstruct the multiIdent.
      // My guess is, that it's required to call renewDelegation
      const devices = await fetchAuthenticatorDevices(BigInt(message.anchor))
      const multiIdent = getMultiIdent(devices)
      send({
        type: "RECEIVE_DELEGATION",
        data: {
          sessionSource: "remoteDevice",
          delegationIdentity: reconstructIdentity(message.reconstructableIdentity),
          identity: multiIdent._actualIdentity as SignIdentity,
        },
      })
    },
    [],
  )

  // FIXME: REFACTOR THE MESSAGE HANDLING INTO MACHINE SERVICES
  React.useEffect(() => {
    const jMessages = messages?.map((m) => JSON.parse(m))
    const remoteRegister = jMessages?.find(isRemoteLoginRegisterMessage)
    const awaitConfirmation = jMessages?.find(isWaitForConfigramtionMessage)

    if (remoteRegister) handleRemoteRegister(remoteRegister)
  }, [messages])


  return (
    <RemoteAuthorizeAppUnknownDevice
      applicationLogo={state.context.appMeta?.logo || ""}
      applicationName={state.context.appMeta?.name || ""}
      registerDeviceDeciderPath={""}
      registerSameDevicePath={""}
      showRegister={false}
      url={remoteReceiverUrl({
        applicationDerivationOrigin:
          state.context.authRequest?.derivationOrigin,
        domain: state.context.authRequest?.hostname as string,
        secret: state.context.secret,
        maxTimeToLive: state.context.authRequest?.maxTimeToLive,
        applicationName: state.context.appMeta?.name,
        applicationLogo: state.context.appMeta?.logo,
      })}
    />
  )
}
