import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"

import clsx from "clsx"

import { ICP_DECIMALS } from "@nfid/integration/token/constants"
import { useSWR } from "@nfid/swr"
import { BlurredLoader, IconCmpWarning } from "@nfid/ui"
import { Spinner } from "@nfid/ui/atoms/spinner"
import { TickerAmount } from "@nfid/ui/molecules/ticker-amount"
import { truncateString } from "@nfid/utils"

import { RPCPromptTemplate } from "frontend/features/identitykit/components/templates/prompt-template"
import { getUserBalance } from "frontend/features/transfer-modal/utils"
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

  const { data: balance } = useSWR(
    identity ? ["userBalance", identity.getPrincipal().toString()] : null,
    ([_, id]) =>
      getUserBalance(
        AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(id),
        }).toHex(),
      ),
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
              className="no-underline text-primaryButtonColor"
              rel="noreferrer"
            >
              {applicationName}
            </a>
          </>
        }
        onPrimaryButtonClick={() => onConfirm()}
        onSecondaryButtonClick={onReject}
        withLogo
      >
        <div
          className={clsx(
            "rounded-xl border border-gray-200 px-3.5 py-2.5 flex-1 space-y-4",
            "text-gray-500 break-all text-sm mt-2.5",
            "overflow-auto max-h-[150px]",
          )}
        >
          <div className="space-y-2">
            <p className="font-bold">Canister ID</p>
            <p className="">{canisterID}</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold">Arguments</p>
            <p
              className={clsx(
                "overflow-auto max-h-44",
                "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
              )}
            >
              {args}
            </p>
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
        {balance ? (
          <div
            className={clsx(
              "bg-gray-50 flex flex-col text-sm text-gray-500",
              "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
            )}
          >
            <div className="flex items-center justify-between">
              <p>Wallet address</p>
              <p>Balance:</p>
            </div>
            <div className="flex items-center justify-between">
              <p>{truncateString(identity.getPrincipal().toString(), 6, 4)}</p>
              <div className="flex items-center space-x-0.5">
                {balance !== undefined ? (
                  <TickerAmount
                    value={Number(balance)}
                    decimals={ICP_DECIMALS}
                    symbol={"ICP"}
                  />
                ) : (
                  <Spinner className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </RPCPromptTemplate>
    </>
  )
}
