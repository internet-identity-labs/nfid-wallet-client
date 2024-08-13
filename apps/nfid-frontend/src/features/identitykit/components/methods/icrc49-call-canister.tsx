import React from "react"

export interface IRPCComponentICRC49 {
  origin: string
  canisterId: string
  consentMessage?: string
  methodName: string
  args: string
  request: any
  onApprove: (data: any) => void
  onReject: () => void
}

// key is `${canisterId}-${methodName}`
const componentsMap: {
  [key: string]: React.LazyExoticComponent<(args: any) => JSX.Element>
} = {
  [`ryjl3-tyaaa-aaaaa-aaaba-cai-transfer`]: React.lazy(
    () => import("../call-canisters/ledger-transfer"),
  ),
  default: React.lazy(() => import("../call-canisters/default")),
}

const RPCComponentICRC49 = (props: IRPCComponentICRC49) => {
  const { canisterId, methodName } = props
  let Cmp = componentsMap[`${canisterId}-${methodName}` as any]
  if (!Cmp) Cmp = componentsMap["default"]

  return <Cmp {...props} />
}

export default RPCComponentICRC49
