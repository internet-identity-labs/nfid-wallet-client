import React from "react"

export interface IRPCComponentICRC49 {
  origin: string
  canisterId: string
  consentMessage?: string
  methodName: string
  args: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onApprove: (data: any) => void
  onReject: () => void
}

// key is `${canisterId}-${methodName}`
const componentsMap: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: React.LazyExoticComponent<(args: any) => JSX.Element>
} = {
  [`ryjl3-tyaaa-aaaaa-aaaba-cai-transfer`]: React.lazy(
    () => import("../call-canisters/transfer"),
  ),
  icrc1_transfer: React.lazy(() => import("../call-canisters/transfer")),
  icrc2_approve: React.lazy(
    () => import("../call-canisters/icrc2-spending-cap"),
  ),
  default: React.lazy(() => import("../call-canisters/default")),
}

const getComponent = (canisterId: string, methodName: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let Cmp = componentsMap[`${canisterId}-${methodName}` as any]
  if (!Cmp) Cmp = componentsMap[methodName]
  if (!Cmp) Cmp = componentsMap["default"]
  return Cmp
}

const RPCComponentICRC49 = (props: IRPCComponentICRC49) => {
  const { canisterId, methodName } = props
  let Cmp = getComponent(canisterId, methodName)

  return <Cmp {...props} />
}

export default RPCComponentICRC49
