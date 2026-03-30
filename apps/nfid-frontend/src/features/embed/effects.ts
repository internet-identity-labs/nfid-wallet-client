import { NFIDEmbedMachineContext } from "./machine"
import { RPC_BASE } from "./services/rpc-receiver"

export const nfidReady = () => {
  const requesterDomain = window.location.ancestorOrigins
    ? window.location.ancestorOrigins[0]
    : window.document.referrer
  console.debug("nfid_ready", {
    origin: requesterDomain,
  })
  window.parent.postMessage({ type: "nfid_ready" }, requesterDomain)
}

export const nfidAuthenticated = () => {
  const requesterDomain = window.location.ancestorOrigins
    ? window.location.ancestorOrigins[0]
    : window.document.referrer
  console.debug("nfid_authenticated", {
    origin: requesterDomain,
  })
  window.parent.postMessage({ type: "nfid_authenticated" }, requesterDomain)
}

export const nfidUnauthenticated = ({
  rpcMessage,
}: NFIDEmbedMachineContext) => {
  if (!rpcMessage?.origin)
    throw new Error("nfid_unauthenticated: missing requestOrigin")

  console.debug("nfid_authenticated")
  window.parent.postMessage({ type: "nfid_unauthenticated" }, rpcMessage.origin)
}

export const sendRPCResponseEffect = (
  _: NFIDEmbedMachineContext,
  { data }: any,
) => {
  const { origin, ...rpcMessage } = data

  console.debug("sendRPCResponse", { rpcMessage })
  window.parent.postMessage(rpcMessage, origin)
}

export const sendRPCCancelResponseEffect = ({
  rpcMessage,
}: NFIDEmbedMachineContext) => {
  if (!rpcMessage?.origin)
    throw new Error("nfid_unauthenticated: missing requestOrigin")
  if (!rpcMessage?.id)
    throw new Error("sendRPCCancelResponse: missing rpcMessage.id")

  window.parent.postMessage(
    {
      ...RPC_BASE,
      id: rpcMessage.id,
      // FIXME: find correct error code
      error: { code: -1, message: "User canceled request" },
    },
    rpcMessage.origin,
  )
}
