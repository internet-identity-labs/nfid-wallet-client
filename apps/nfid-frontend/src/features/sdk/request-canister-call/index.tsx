import { AccountIdentifier } from "@dfinity/ledger-icp"
import clsx from "clsx"
import useSWR from "swr"

import { Button, IconCmpWarning } from "@nfid-frontend/ui"

import { AuthAppMeta } from "frontend/features/authentication/ui/app-meta"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { icTransferConnector } from "frontend/ui/connnector/transfer-modal/ic/ic-transfer-connector"

import { SDKFooter } from "../ui/footer"

export interface IRequestTransferProps {
  origin: string
  appMeta: AuthorizingAppMeta
  method: string
  canisterID: string
  args: string
  onConfirm: () => void
  onReject: () => void
}
export const RequestCanisterCall = ({
  appMeta,
  method,
  canisterID,
  args,
  onConfirm,
  onReject,
}: IRequestTransferProps) => {
  console.log({ appMeta })

  const { data: identity } = useSWR("globalIdentity", () =>
    getWalletDelegationAdapter("nfid.one", "-1"),
  )
  const { data: balance } = useSWR(
    identity ? ["userBalance", identity] : null,
    ([key, identity]) =>
      icTransferConnector.getBalance(
        AccountIdentifier.fromPrincipal({
          principal: identity.getPrincipal(),
        }).toHex(),
      ),
  )

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url ?? appMeta.name}
        applicationName={appMeta?.name}
        title={method}
        subTitle="Request from"
      />
      <div
        className={clsx(
          "grid grid-cols-[22px,1fr] space-x-1.5 text-sm rounded-md",
          "bg-orange-50 p-[15px] mt-4 text-orange-900",
        )}
      >
        <div>
          <IconCmpWarning className="text-orange-900 h-[22px]" />
        </div>
        <div>
          <p className="font-bold leading-[20px]">Approval not recommended</p>
          <p className="mt-0.5">
            Unable to verify the safety of this approval. Please make sure you
            trust this dapp.
          </p>
        </div>
      </div>
      <div
        className={clsx(
          "rounded-md bg-gray-50 px-3.5 py-2.5 flex-1 space-y-3",
          "text-gray-500 break-all text-sm mt-2.5",
        )}
      >
        <div className="flex space-x-2.5">
          <span className="w-[100px] shrink-0">Canister ID</span>
          <span className="text-black">{canisterID}</span>
        </div>
        <span className="text-gray-500 mt-2.5">{args}</span>
      </div>
      <div className="space-y-2.5 flex flex-col mb-14 mt-6">
        <Button type="primary" onClick={onConfirm}>
          Approve
        </Button>
        <Button type="stroke" onClick={onReject}>
          Reject
        </Button>

        <SDKFooter identity={identity} balance={balance} />
      </div>
    </>
  )
}
