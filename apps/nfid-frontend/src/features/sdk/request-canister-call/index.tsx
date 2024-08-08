import clsx from "clsx"
import useSWR from "swr"

import { BlurredLoader, IconCmpWarning } from "@nfid-frontend/ui"

import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"

export interface IRequestTransferProps {
  origin: string
  method: string
  canisterID: string
  args: string
  onConfirm: () => void
  onReject: () => void
}
export const RequestCanisterCall = ({
  method,
  canisterID,
  args,
  onConfirm,
  onReject,
}: IRequestTransferProps) => {
  const applicationName = new URL(origin).host

  const { data: identity } = useSWR("globalIdentity", () =>
    getWalletDelegationAdapter("nfid.one", "-1"),
  )

  if (!identity) return <BlurredLoader isLoading />

  return (
    <>
      <RPCPromptTemplate
        title={method}
        subTitle={
          <>
            Request from{" "}
            <a
              href={origin}
              target="_blank"
              className="text-[#146F68] no-underline"
              rel="noreferrer"
            >
              {applicationName}
            </a>
          </>
        }
        onPrimaryButtonClick={() => onConfirm()}
        onSecondaryButtonClick={onReject}
        senderPrincipal={identity?.getPrincipal()?.toString()}
      >
        <div
          className={clsx(
            "rounded-xl border border-gray-200 px-3.5 py-2.5 flex-1 space-y-4",
            "text-gray-500 break-all text-sm mt-2.5",
            "overflow-auto",
          )}
        >
          <div className="space-y-2">
            <p className="font-bold">Canister ID</p>
            <p className="">{canisterID}</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold">Arguments</p>
            <p className="">{args}</p>
          </div>
        </div>
        <div
          className={clsx(
            "grid grid-cols-[22px,1fr] gap-2.5 text-sm rounded-xl",
            "bg-orange-50 p-[15px] mt-4 text-orange-900",
          )}
        >
          <IconCmpWarning className="text-orange-900 w-[22px] h-[22px] shrink-1" />
          <p>
            <span className="font-bold leading-[20px]">
              Proceed with caution.
            </span>{" "}
            Unable to verify the safety of this approval. Please make sure you
            trust this dapp.
          </p>
        </div>
      </RPCPromptTemplate>
    </>
  )
}
