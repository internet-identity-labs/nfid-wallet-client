import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import React, { useCallback, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { Badge, Button, IconCmpOut } from "@nfid-frontend/ui"
import {
  approveTransaction,
  TransactionState
} from "@nfid/integration"

import { Accordion } from "frontend/ui/atoms/accordion"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import {
  IVaultTransactionsDetails,
  VaultBadgeStatuses,
} from "../transactions-page/table/table-row"
import { VaultTransactionInfo } from "./info-block"
import { TransactionInfoRow } from "./info-row"
import { VaultTransactionRejectReason } from "./rejected-modal"
import { TransactionStatusArrow } from "./status-arrow"

export const VaultTransactionsDetailsPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState<IVaultTransactionsDetails>()
  const location = useLocation()

  useEffect(() => {
    setState(location.state as IVaultTransactionsDetails)
  }, [location.state])

  const onChangeStatus = useCallback(
    async (status: TransactionState) => {
      if (!state?.id) return
      try {
        setIsLoading(true)
        await approveTransaction({
          transactionId: state.id,
          state: status,
        })
        window.history.back()
      } catch (e: any) {
        console.log({ e })
        toaster.error(e.message)
      } finally {
        setIsLoading(false)
      }
    },
    [state?.id],
  )

  return (
    <ProfileTemplate
      isLoading={isLoading}
      pageTitle="Transaction details"
      showBackButton
    >
      <div className="relative flex flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <VaultTransactionInfo
            title={`From: ${state?.fromWalletName}`}
            value={state?.fromAddress ?? ""}
            direction="right"
          />
        </div>
        <div className="w-full md:w-1/2 mt-[10px] md:mt-0">
          <VaultTransactionInfo
            title={"To:"}
            value={state?.toAddress ?? ""}
            direction="left"
          />
        </div>
        <TransactionStatusArrow state={state?.status} />
      </div>
      <div className="flex items-center justify-between mb-8 mt-7">
        <p className="text-xl font-bold">Details</p>
        <div
          className={clsx(
            "flex items-center text-blue-600 cursor-pointer",
            state?.status !== TransactionState.APPROVED && "hidden",
          )}
        >
          <p className="mr-2 text-sm font-bold">View on block explorer</p>
          <IconCmpOut />
        </div>
      </div>
      <div>
        <TransactionInfoRow
          title="Tokens"
          content={
            <div>
              <p>{state?.amountICP} ICP</p>
              <p className="text-xs text-secondary">≈{state?.amountUSD}</p>
            </div>
          }
        />
        <TransactionInfoRow
          title="Initiated by"
          content={`${state?.ownerName} ${
            state?.isInitiatedByYou ? "(You)" : ""
          }`}
        />
        <TransactionInfoRow
          title="Date and time"
          content={state?.createdDate}
        />
        <TransactionInfoRow
          title="Status"
          content={
            <div className="flex items-center justify-between">
              <Badge
                type={VaultBadgeStatuses[state?.status ?? "CANCELED"]}
                children={state?.status}
              />
              {state?.memo ? (
                <VaultTransactionRejectReason error={state?.memo} />
              ) : null}
            </div>
          }
        />
        <TransactionInfoRow
          title="Approvals"
          titleClassName="align-top h-full mt-1"
          content={
            <Accordion
              className="!p-0 text-secondary"
              titleClassName="!text-sm font-normal text-black"
              detailsClassName="mt-2"
              title={`${
                state?.approvers.filter((approver) => approver.isApproved)
                  .length
              } of ${state?.memberThreshold}`}
              isBorder={false}
              details={
                <div className="grid grid-cols-1 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {state?.approvers.map((member, index) => (
                    <div
                      className="flex items-center h-10"
                      key={`approver_${member.name}_${index}`}
                    >
                      <span
                        className={clsx(
                          "w-2 h-2 rounded-full mr-2.5 bg-gray-100",
                          member.isApproved && "bg-emerald-500",
                        )}
                      />
                      <p>{member.name}</p>
                    </div>
                  ))}
                </div>
              }
            />
          }
        />
        <div
          className={clsx(
            "flex justify-end mt-5",
            state?.status !== TransactionState.PENDING && "hidden",
          )}
        >
          <Button
            onClick={() => onChangeStatus(TransactionState.REJECTED)}
            className={clsx(!state?.isApprovedByYou && "hidden")}
            type="primary"
          >
            Cancel transaction
          </Button>
          <Button
            onClick={() => onChangeStatus(TransactionState.REJECTED)}
            className={clsx("mr-5", state?.isApprovedByYou && "hidden")}
            type="stroke"
          >
            Rejected
          </Button>
          <Button
            onClick={() => onChangeStatus(TransactionState.APPROVED)}
            className={clsx(state?.isApprovedByYou && "hidden")}
            type="primary"
          >
            Approve
          </Button>
        </div>
      </div>
    </ProfileTemplate>
  )
}
export default VaultTransactionsDetailsPage
