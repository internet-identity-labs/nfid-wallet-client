import clsx from "clsx"
import React from "react"
import useSWR from "swr"

import { Button, Loader, Skeleton } from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"

import { AuthAppMeta } from "../authentication/ui/app-meta"
import { icRequestTransferConnector } from "./ic/ic-request-transfer"

export interface IRequestTransferProps {
  appMeta: AuthorizingAppMeta
  amount: number
}
export const RequestTransfer: React.FC<IRequestTransferProps> = ({
  appMeta,
  amount,
}) => {
  const { data: identity } = useSWR("userIdentity", () =>
    icRequestTransferConnector.getIdentity(),
  )

  const { data: balance } = useSWR("userBalance", () =>
    icRequestTransferConnector.getBalance(),
  )

  const { data: fee } = useSWR("requestFee", () =>
    icRequestTransferConnector.getFee(),
  )

  if (!fee) return <Loader isLoading={true} />

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
        <p className="text-[32px] font-medium">{amount} ICP</p>
        <p className="text-sm text-gray-400">$4.89</p>
      </div>
      <div className="flex flex-col my-5">
        <div className="flex items-center justify-between text-sm border-b border-gray-200 h-14">
          <p>Network fee</p>
          <div className="text-right">
            <p>{fee.feeUsd}</p>
            <p className="text-xs text-gray-400">{fee.fee} ICP</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm h-14">
          <p className="font-bold">Total</p>
          <div className="text-right">
            <p className="font-bold">$4.89</p>
            <p className="text-xs text-gray-400">
              {amount + Number(fee.fee)} ICP
            </p>
          </div>
        </div>
        <p className="text-sm text-blue-600 cursor-pointer hover:opacity-70">
          Transaction details
        </p>
      </div>
      <div className="space-y-2.5 flex flex-col pb-14 mt-6">
        <Button type="primary">Approve</Button>
        <Button type="stroke">Reject</Button>
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
            {identity?.getPrincipal().toString() ?? (
              <Skeleton className="w-40 h-5 bg-gray-300" />
            )}
          </div>
          <div className="flex items-center space-x-0.5">
            <span id="balance">
              {balance ? (
                `${balance} ICP`
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
