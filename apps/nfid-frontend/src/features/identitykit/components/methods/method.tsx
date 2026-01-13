import React from "react"

import { BlurredLoader } from "@nfid/ui"

export interface RPCComponentProps {
  method: RPCComponentsUI
  props: any
}

export enum RPCComponentsUI {
  "icrc27_accounts" = "icrc27_accounts",
  "icrc34_delegation" = "icrc34_delegation",
  "icrc49_call_canister" = "icrc49_call_canister",
}

const componentsMap = {
  [RPCComponentsUI.icrc27_accounts]: React.lazy(
    () => import("./icrc27-accounts"),
  ),
  [RPCComponentsUI.icrc34_delegation]: React.lazy(
    () => import("./icrc34-delegation"),
  ),
  [RPCComponentsUI.icrc49_call_canister]: React.lazy(
    () => import("./icrc49-call-canister"),
  ),
}

export const RPCComponent = ({ method, props }: RPCComponentProps) => {
  const ApproverCmp = componentsMap[method]

  return (
    <React.Suspense
      fallback={<BlurredLoader loadingMessage="Painting interfaces..." />}
    >
      <ApproverCmp {...props} />
    </React.Suspense>
  )
}
