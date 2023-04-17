import { useMemo } from "react"

import { RPCMessage } from "frontend/features/embed/services/rpc-receiver"
import { AuthSession } from "frontend/state/authentication"

import { ConnectionDetails } from "../ui/connection-details"

interface IMappedConnectionDetails {
  rpcMessage?: RPCMessage

  authSession?: AuthSession
  onCancel: () => void
}

export const MappedConnectionDetails = ({
  rpcMessage,
  authSession,
  onCancel,
}: IMappedConnectionDetails) => {
  const details = useMemo(() => {
    return [
      { label: "Anchor", value: String(authSession?.anchor) },
      {
        label: "RPC ID",
        value: rpcMessage?.id,
      },
      {
        label: "Method",
        value: rpcMessage?.method,
      },
      {
        label: "jsonrpc",
        value: rpcMessage?.jsonrpc,
      },
    ]
  }, [
    authSession?.anchor,
    rpcMessage?.id,
    rpcMessage?.jsonrpc,
    rpcMessage?.method,
  ])

  return <ConnectionDetails onBack={onCancel} details={details} />
}
