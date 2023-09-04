import clsx from "clsx"
import React, { useState } from "react"
import useSWR from "swr"

import { BlurredLoader, Button, Skeleton } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { E8S, WALLET_FEE_E8S } from "@nfid/integration/token/icp"

import { getExchangeRate } from "frontend/integration/rosetta/get-exchange-rate"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import { icTransferConnector } from "frontend/ui/connnector/transfer-modal/ic/ic-transfer-connector"

import { AuthAppMeta } from "../authentication/ui/app-meta"
import { toUSD } from "../fungable-token/accumulate-app-account-balances"
import { TransferSuccess } from "../transfer-modal/components/success"
import { IRequestTransferResponse, TransferStatus } from "./types"

export interface IRequestTransferProps {
  appMeta: AuthorizingAppMeta
  amount: string
  sourceAddress: string
  destinationAddress: string
  onConfirmIC: (data: IRequestTransferResponse) => void
}
export const RequestTransfer: React.FC<IRequestTransferProps> = ({
  appMeta,
  amount,
  sourceAddress,
  destinationAddress,
  onConfirmIC,
}) => {
  const [isTransferInProgress, setIsTransferInProgress] = useState(false)
  const { data: identity } = useSWR(
    sourceAddress ? [sourceAddress, "userIdentity"] : null,
    ([address]) => icTransferConnector.getIdentity(address),
  )

  const { data: balance } = useSWR("userBalance", () =>
    icTransferConnector.getBalance(sourceAddress),
  )

  const { data: fee } = useSWR("requestFee", () => icTransferConnector.getFee())
  const { data: rate } = useSWR("icpRate", getExchangeRate)

  if (!fee || typeof rate === "undefined")
    return <BlurredLoader isLoading={true} />

  if (isTransferInProgress)
    return (
      <TransferSuccess
        initialPromise={
          new Promise(async (resolve) => {
            try {
              let transferIdentity =
                identity ??
                (await icTransferConnector.getIdentity(sourceAddress))

              const res = await icTransferConnector.transfer({
                amount: Number(amount) / E8S,
                identity: transferIdentity,
                to: destinationAddress,
                currency: "ICP",
                contract: "",
              })
              resolve(res)
            } catch (e: any) {
              onConfirmIC({
                status: TransferStatus.ERROR,
                message: e?.message ?? "Request failed",
              })
            }
          })
        }
        callback={(res) =>
          onConfirmIC({ status: TransferStatus.SUCCESS, hash: res?.hash })
        }
        errorCallback={(res) =>
          onConfirmIC({
            status: TransferStatus.ERROR,
            message: res?.errorMessage?.message ?? "Request failed",
          })
        }
        title={`${(Number(amount) + Number(WALLET_FEE_E8S)) / E8S} ICP`}
        subTitle={toUSD(
          (Number(amount) + Number(WALLET_FEE_E8S)) / E8S,
          Number(rate),
        )}
        assetImg={icTransferConnector.getTokenConfig()?.icon ?? ""}
        isAssetPadding
        withToasts={false}
      />
    )

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url ?? appMeta.name}
        applicationName={appMeta?.name}
        title="Approve transfer"
        subTitle="Request from"
      />
      <div className="flex flex-col mt-5 text-center">
        <p className="text-[32px] font-medium">{Number(amount) / E8S} ICP</p>
        <p className="text-sm text-gray-400">
          {toUSD(Number(amount) / E8S, Number(rate))}
        </p>
      </div>
      <div className="flex flex-col my-5">
        <div className="flex items-center justify-between text-sm border-b border-gray-200 h-14">
          <p>Network fee</p>
          <div className="text-right">
            <p>{fee.feeUsd}</p>
            <p className="text-xs text-gray-400">{fee.fee}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm h-14">
          <p className="font-bold">Total</p>
          <div className="text-right">
            <p className="font-bold">
              {toUSD(
                (Number(amount) + Number(WALLET_FEE_E8S)) / E8S,
                Number(rate),
              )}
            </p>
            <p className="text-xs text-gray-400">
              {(Number(amount) + Number(WALLET_FEE_E8S)) / E8S} ICP
            </p>
          </div>
        </div>
        <p className="text-sm text-blue-600 cursor-pointer hover:opacity-70">
          Transaction details
        </p>
      </div>
      <div className="space-y-2.5 flex flex-col mb-14 mt-6">
        <Button type="primary" onClick={() => setIsTransferInProgress(true)}>
          Approve
        </Button>
        <Button
          type="stroke"
          onClick={() =>
            onConfirmIC({
              status: TransferStatus.REJECTED,
              message: "Rejected by user",
            })
          }
        >
          Reject
        </Button>
      </div>
      <div
        className={clsx(
          "bg-gray-50 flex flex-col text-sm text-gray-500",
          "text-xs absolute bottom-0 left-0 w-full px-5 py-3 round-b-xl",
        )}
      >
        <div className="flex items-center justify-between">
          <p>Internet Computer</p>
          <p>Balance</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {identity?.getPrincipal().toString() ? (
              truncateString(identity?.getPrincipal().toString(), 6, 4)
            ) : (
              <Skeleton className="w-40 h-5 bg-gray-300" />
            )}
          </div>
          <div className="flex items-center space-x-0.5">
            <span id="balance">
              {balance ? (
                `${balance.balance} ICP`
              ) : (
                <Skeleton className="w-20 h-5 bg-gray-300" />
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
