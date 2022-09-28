import { SignIdentity } from "@dfinity/agent"
import { useActor } from "@xstate/react"
import React from "react"

import {
  getMultiIdent,
  lookup,
  reconstructIdentity,
} from "frontend/integration/internet-identity"
import {
  isRemoteLoginRegisterMessage,
  RemoteLoginRegisterMessage,
  useMessages,
} from "frontend/integration/pubsub"
import { RemoteReceiverActor } from "frontend/state/machines/authentication/remote-receiver"
import { RemoteAuthorizeAppUnknownDevice } from "frontend/ui/pages/remote-authorize-app-unknown-device"

function remoteReceiverUrl({
  domain,
  secret,
  maxTimeToLive = BigInt(Date.now() + 7 * 24 * 60 * 60 * 1e9),
  applicationName,
  applicationLogo,
  applicationDerivationOrigin,
}: {
  domain: string | undefined
  secret: string
  maxTimeToLive?: bigint
  applicationName?: string
  applicationLogo?: string
  applicationDerivationOrigin?: string
}) {
  const query = new URLSearchParams({
    secret,
    scope: domain || "",
    derivationOrigin: applicationDerivationOrigin || "",
    maxTimeToLive: maxTimeToLive.toString() || "",
    applicationName: applicationName || "",
    applicationLogo: encodeURIComponent(applicationLogo || ""),
  }).toString()

  const path = `/ridp/`
  console.debug(remoteReceiverUrl.name, {
    path: encodeURI(`${path}?${query.toString()}`),
  })

  return `${window.location.origin}${path}?${query.toString()}`
}

export function RemoteReceiverCoordinator({
  actor,
}: Actor<RemoteReceiverActor>) {
  const [state, send] = useActor(actor)
  // FIXME: REFACTOR THE MESSAGE HANDLING INTO MACHINE SERVICES
  const { messages } = useMessages(state.context.secret)
  console.debug("RemoteReceiverCoordinator", { messages })

  React.useEffect(() => {
    console.debug("RemoteReceiverCoordinator", { state: state.value })
  }, [state.value])

  const QRCodeUrl = React.useMemo(
    () =>
      remoteReceiverUrl({
        applicationDerivationOrigin:
          state.context.authRequest?.derivationOrigin,
        domain: state.context.authRequest?.hostname,
        secret: state.context.secret,
        maxTimeToLive: state.context.authRequest?.maxTimeToLive,
        applicationName: state.context.appMeta?.name,
        applicationLogo: state.context.appMeta?.logo,
      }),
    [
      state.context.appMeta?.logo,
      state.context.appMeta?.name,
      state.context.authRequest?.derivationOrigin,
      state.context.authRequest?.hostname,
      state.context.authRequest?.maxTimeToLive,
      state.context.secret,
    ],
  )

  // FIXME: REFACTOR THE MESSAGE HANDLING INTO MACHINE SERVICES
  const handleRemoteRegister = React.useCallback(
    async (message: RemoteLoginRegisterMessage) => {
      console.debug("handleRemoteRegister", { message })
      // FIXME: Not sure if we need to reconstruct the multiIdent.
      // My guess is, that it's required to call renewDelegation
      const devices = await lookup(
        message.anchor,
        (x) => x.purpose === "authentication",
      )
      const multiIdent = getMultiIdent(devices)
      console.debug("handleRemoteRegister", { devices })
      send({
        type: "RECEIVE_DELEGATION",
        data: {
          sessionSource: "remoteDevice",
          anchor: message.anchor,
          delegationIdentity: reconstructIdentity(
            message.reconstructableIdentity,
          ),
          identity: multiIdent._actualIdentity as SignIdentity,
        },
      })
    },
    [send],
  )

  // FIXME: REFACTOR THE MESSAGE HANDLING INTO MACHINE SERVICES
  React.useEffect(() => {
    const remoteRegister = messages
      ?.map((m) => JSON.parse(m))
      ?.find(isRemoteLoginRegisterMessage)

    if (remoteRegister) handleRemoteRegister(remoteRegister)
  }, [handleRemoteRegister, messages])

  return (
    <RemoteAuthorizeAppUnknownDevice
      applicationLogo={state.context.appMeta?.logo || ""}
      applicationName={state.context.appMeta?.name || ""}
      onClickBack={() => send({ type: "BACK" })}
      registerDeviceDeciderPath={""}
      registerSameDevicePath={""}
      showRegister={false}
      url={QRCodeUrl}
    />
  )
}
