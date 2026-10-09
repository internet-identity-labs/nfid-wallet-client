/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import { motion } from "framer-motion"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { Button } from "packages/ui/src/molecules/button"
import { ArrowButton } from "packages/ui/src/molecules/button/arrow-button"
import { useDisableScroll } from "packages/ui/src/molecules/modal/hooks/disable-scroll"
import { FC, useEffect, useState } from "react"
import {
  getBatchSidePanelContent,
  getDepositSidePanelContent,
  getSidePanelMarkupByType,
  isCreateVaultGroup,
  vaultTxTimestampToDate,
  vaultTxTimestampToTime,
  vaultDateToString,
  vaultDateToTime,
} from "../utils"
import { VaultSidePanelProps } from "../types"
import { TransactionState, TransactionType } from "@nfid/vaults"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { AccountIdentifier } from "@icp-sdk/canisters/ledger/icp"
import { FeeResponse } from "frontend/integration/ft/utils"
import { noteService } from "frontend/integration/note/note-service"
import { IcpNoteKey } from "frontend/integration/note/note-key"
import { IconCaret } from "packages/ui/src/atoms/icons/caret"
import { useDarkTheme } from "frontend/hooks"
import { useIdentity } from "frontend/hooks/identity"
import { IconWalletApproved } from "packages/ui/src/atoms/icons/wallet-approved"
import { IconWalletRejected } from "packages/ui/src/atoms/icons/wallet-rejected"
import { IconWallet } from "packages/ui/src/atoms/icons/wallet"
import toaster from "packages/ui/src/atoms/toast"

const DEFAULT_VAULT_ERROR = "Something went wrong"

export const VaultSidePanel: FC<VaultSidePanelProps> = ({
  isOpen,
  onClose,
  txGroup,
  deposit,
  vaultId,
  tokens,
  members,
  xdrPermyriadPerIcp,
  quorum,
  approve,
  reject,
}) => {
  const isBatch = (txGroup?.length ?? 0) > 1
  const isCreateVault = txGroup ? isCreateVaultGroup(txGroup) : false
  const tx = txGroup?.[0] ?? null
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [depositFee, setDepositFee] = useState<FeeResponse | undefined>()
  const [depositNote, setDepositNote] = useState<string | undefined>()
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)
  const [fee, setFee] = useState<FeeResponse | undefined>()
  const isDarkTheme = useDarkTheme()
  const { identity } = useIdentity()
  const currentUserId = identity
    ? AccountIdentifier.fromPrincipal({
        principal: identity.getPrincipal(),
      }).toHex()
    : undefined
  useDisableScroll(isOpen)

  const onApprove = async () => {
    if (!txGroup?.length) return
    try {
      setIsApproving(true)
      await approve?.(txGroup.map((t) => t.id.toString()))
      toaster.success("Transaction was approved.")
      onClose()
    } catch (e) {
      console.error("Approve transaction error:", e)
      toaster.error(DEFAULT_VAULT_ERROR)
    } finally {
      setIsApproving(false)
    }
  }

  const onReject = async () => {
    if (!txGroup?.length) return
    try {
      setIsRejecting(true)
      await reject?.(txGroup.map((t) => t.id.toString()))
      toaster.success("Transaction was rejected.")
      onClose()
    } catch (e) {
      console.error("Reject transaction error:", e)
      toaster.error(DEFAULT_VAULT_ERROR)
    } finally {
      setIsRejecting(false)
    }
  }

  useEffect(() => {
    const icpToken = tokens?.find(
      (t) => t.getTokenAddress() === ICP_CANISTER_ID,
    )
    if (!icpToken) return
    icpToken.getTokenFee().then(setFee)
  }, [tokens])

  useEffect(() => {
    if (!deposit) return
    const depositToken = tokens?.find(
      (t) => t.getTokenAddress() === deposit.canisterId,
    )
    if (depositToken) depositToken.getTokenFee().then(setDepositFee)
    noteService
      .getNotes([new IcpNoteKey(BigInt(deposit.id), deposit.canisterId)])
      .then((notes) => setDepositNote(notes[0]?.value))
  }, [deposit, tokens])

  return (
    <div>
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-48 left-0 top-0",
          "w-screen h-screen",
          !isOpen && "hidden",
        )}
      />
      <div
        className={clsx(
          "w-[90vw] md:w-[600px] h-screen fixed top-0 right-0 transition-all duration-500",
          "bg-white dark:bg-darkGray shadow-[0px_4px_40px_rgba(0,0,0,0.2)] z-[49] transform p-[30px] overflow-auto",
          !isOpen ? "translate-x-[800px]" : "translate-x-0",
        )}
      >
        {deposit ? (
          <>
            <div className="flex items-center justify-between h-[70px]">
              <div className="flex space-x-2.5 items-center">
                <ArrowButton
                  buttonClassName="py-[7px] dark:hover:bg-zinc-700"
                  onClick={onClose}
                  iconClassName="text-black dark:text-white"
                />
                <p className="text-[28px] dark:text-white">Deposit</p>
              </div>
            </div>
            <motion.div
              key="DepositPanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {getDepositSidePanelContent(deposit, vaultId, tokens)}
              <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[16px] mt-5">
                <div className="text-[24px] leading-[50px] dark:text-white flex items-center justify-between">
                  <span>Details</span>
                  <div
                    className={clsx(
                      "p-3 cursor-pointer transition-all duration-200",
                      isDetailsOpen ? "rotate-[-90deg]" : "rotate-[90deg]",
                    )}
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  >
                    <IconCaret color={isDarkTheme ? "white" : "black"} />
                  </div>
                </div>
                <motion.div
                  initial={false}
                  animate={
                    isDetailsOpen
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                  className="dark:text-white"
                >
                  <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px] mt-[10px]">
                    <p className="text-gray-400 dark:text-zinc-500">
                      Processed
                    </p>
                    <div>
                      <p>{vaultDateToString(deposit.timestamp)}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {vaultDateToTime(deposit.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                  <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400 dark:text-zinc-500">
                      Network fee
                    </p>
                    <div>
                      {depositFee &&
                        (() => {
                          const depositToken = tokens?.find(
                            (t) => t.getTokenAddress() === deposit.canisterId,
                          )
                          return depositToken ? (
                            <>
                              <p className="dark:text-white">
                                {depositToken.getTokenFeeFormatted(
                                  depositFee.getFee(),
                                )}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-zinc-500">
                                {depositToken.getTokenFeeFormattedUsd(
                                  depositFee.getFee(),
                                )}
                              </p>
                            </>
                          ) : null
                        })()}
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                  <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400 dark:text-zinc-500">Note</p>
                    <p>{depositNote}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : !tx ? null : (
          <>
            <div className="flex items-center justify-between h-[70px]">
              <div className="flex space-x-2.5 items-center">
                <ArrowButton
                  buttonClassName="py-[7px] dark:hover:bg-zinc-700"
                  onClick={onClose}
                  iconClassName="text-black dark:text-white"
                />
                <p className="text-[28px] dark:text-white">
                  {isCreateVault
                    ? "Create NFID Vault"
                    : isBatch
                      ? "Batch transaction"
                      : getSidePanelMarkupByType(tx)?.title}
                </p>
              </div>
              <div
                className={clsx(
                  "leading-4 text-sm tracking-[0.6%]",
                  (tx.state === TransactionState.Pending ||
                    tx.state === TransactionState.Blocked) &&
                    "text-gray-400 dark:text-zinc-500",
                  (tx.state === TransactionState.Executed ||
                    tx.state === TransactionState.Purged) &&
                    "text-emerald-600",
                  (tx.state === TransactionState.Executed ||
                    tx.state === TransactionState.Purged) &&
                    "text-emerald-600",
                  (tx.state === TransactionState.Failed ||
                    tx.state === TransactionState.Rejected) &&
                    "text-red-600",
                )}
              >
                {tx?.state}
              </div>
            </div>
            <motion.div
              key="VaultPanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {isBatch ? (
                <div>
                  {getBatchSidePanelContent(
                    txGroup!,
                    vaultId,
                    tokens,
                    members,
                    xdrPermyriadPerIcp,
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[20px] relative">
                  <div>
                    <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Transaction number
                        </p>
                      </div>
                      <div className="dark:text-white">{tx.id.toString()}</div>
                    </div>
                    {!isCreateVault && (
                      <>
                        <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                        {
                          getSidePanelMarkupByType(
                            tx,
                            vaultId,
                            tokens,
                            members,
                            xdrPermyriadPerIcp,
                          )?.info
                        }
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[16px] mt-5">
                <div className="text-[24px] leading-[50px] dark:text-white flex items-center justify-between">
                  <span>Details</span>
                  <div
                    className={clsx(
                      "p-3 cursor-pointer transition-all duration-200",
                      isDetailsOpen ? "rotate-[-90deg]" : "rotate-[90deg]",
                    )}
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  >
                    <IconCaret color={isDarkTheme ? "white" : "black"} />
                  </div>
                </div>
                <motion.div
                  initial={false}
                  animate={
                    isDetailsOpen
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                  className="dark:text-white"
                >
                  <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px] mt-[10px]">
                    <p className="text-gray-400 dark:text-zinc-500">
                      Initiated by
                    </p>
                    <p>
                      {members?.find((m) => m.userId === tx.initiator)?.name ??
                        "Initiator"}
                    </p>
                  </div>
                  <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                  <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400 dark:text-zinc-500">
                      Initiated on
                    </p>
                    <div>
                      <p>{vaultTxTimestampToDate(tx.createdDate)}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {vaultTxTimestampToTime(tx.createdDate)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                  <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                    <p className="text-gray-400 dark:text-zinc-500">
                      Processed
                    </p>
                    {tx.state === TransactionState.Executed ||
                    tx.state === TransactionState.Rejected ||
                    tx.state === TransactionState.Failed ||
                    tx.state === TransactionState.Purged ? (
                      <div>
                        <p>{vaultTxTimestampToDate(tx.modifiedDate)}</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">
                          {vaultTxTimestampToTime(tx.modifiedDate)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {(tx.transactionType ===
                    TransactionType.TransferICRC1Quorum ||
                    tx.transactionType === TransactionType.TransferQuorum ||
                    tx.transactionType === TransactionType.TopUpQuorum) && (
                    <>
                      <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                      <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Network fee
                        </p>
                        <div>
                          {fee &&
                            (() => {
                              const icpToken = tokens?.find(
                                (t) => t.getTokenAddress() === ICP_CANISTER_ID,
                              )
                              return icpToken ? (
                                <>
                                  <p className="dark:text-white">
                                    {icpToken.getTokenFeeFormatted(
                                      fee.getFee(),
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-zinc-500">
                                    {icpToken.getTokenFeeFormattedUsd(
                                      fee.getFee(),
                                    )}
                                  </p>
                                </>
                              ) : null
                            })()}
                        </div>
                      </div>
                    </>
                  )}
                  {(tx.transactionType ===
                    TransactionType.TransferICRC1Quorum ||
                    tx.transactionType === TransactionType.TransferQuorum) && (
                    <>
                      <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                      <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                        <p className="text-gray-400 dark:text-zinc-500">Note</p>
                        <div>
                          <p>{tx.memo}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {!isCreateVault && (
                    <>
                      <div className="w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                      <div className="grid grid-cols-[160px_1fr] text-sm items-start min-h-[54px]">
                        <p className="text-gray-400 dark:text-zinc-500 leading-[54px]">
                          Approval progress
                        </p>
                        <div>
                          <p className="leading-[54px]">
                            {
                              tx.approves.filter(
                                (a) => a.status === TransactionState.Approved,
                              ).length
                            }{" "}
                            approved of {tx.threshold ?? quorum} required
                          </p>
                          {members?.map((m) => {
                            const approval = tx.approves.find(
                              (a) => a.signer === m.userId,
                            )
                            return (
                              <div
                                key={m.userId}
                                className="h-[30px] flex items-center gap-1.5 mb-0.5"
                              >
                                {!approval ? (
                                  <IconWallet className="w-[18px] h-[18px] min-w-[18px] text-gray-400 dark:text-zinc-500" />
                                ) : approval.status ===
                                  TransactionState.Approved ? (
                                  <IconWalletApproved />
                                ) : (
                                  <IconWalletRejected />
                                )}
                                <p
                                  className={clsx(
                                    "leading-5 text-sm",
                                    !approval &&
                                      "text-gray-400 dark:text-zinc-500",
                                  )}
                                >
                                  {m.name}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
              {(tx.state === TransactionState.Blocked ||
                tx.state === TransactionState.Pending) && (
                <div className="flex gap-5 mt-5">
                  <Button
                    type="stroke"
                    icon={
                      isRejecting ? (
                        <Spinner className="w-5 h-5 text-gray-300 dark:text-white" />
                      ) : null
                    }
                    disabled={
                      isApproving ||
                      isRejecting ||
                      tx.state === TransactionState.Blocked ||
                      tx.approves.some((a) => a.signer === currentUserId)
                    }
                    onClick={onReject}
                    className={clsx("w-full")}
                  >
                    Reject
                  </Button>
                  <Button
                    icon={
                      isApproving ? (
                        <Spinner className="w-5 h-5 text-gray-300 dark:text-white" />
                      ) : null
                    }
                    disabled={
                      isApproving ||
                      isRejecting ||
                      tx.state === TransactionState.Blocked ||
                      tx.approves.some((a) => a.signer === currentUserId)
                    }
                    onClick={onApprove}
                    className={clsx("w-full")}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
