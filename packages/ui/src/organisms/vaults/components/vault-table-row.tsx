import clsx from "clsx"
import BigNumber from "bignumber.js"
import {
  TransactionState,
  TransactionType,
  TransferICRC1QuorumTransaction,
  TransferQuorumTransaction,
} from "@nfid/vaults"
import {
  vaultTxTimestampToTime,
  getTxMarkupByType,
  isCreateVaultGroup,
} from "../utils"
import { IconWallet } from "packages/ui/src/atoms/icons/wallet"
import { VaultTableRowProps } from "../types"
import { useMemo } from "react"
import { ICP_CANISTER_ID, TRIM_ZEROS } from "@nfid/integration/token/constants"

export const VaultTableRow = ({
  setChosenTransaction,
  txGroup,
  vaultId,
  tokens,
  members,
  xdrPermyriadPerIcp,
  quorum,
  allTransactions,
}: VaultTableRowProps) => {
  const tx = txGroup[0]
  const isBatch = txGroup.length > 1
  const isCreateVault = isCreateVaultGroup(txGroup)
  const sortedGroup = isBatch
    ? [...txGroup].sort((a, b) => Number(a.id - b.id))
    : txGroup

  const tokenAmount = useMemo(() => {
    if (!tokens || isBatch) return

    let rawAmount: bigint | undefined
    let tokenAddress: string | undefined

    if (tx.transactionType === TransactionType.TransferICRC1Quorum) {
      const t = tx as TransferICRC1QuorumTransaction
      rawAmount = t.amount
      tokenAddress = t.ledger_id.toText()
    } else if (
      tx.transactionType === TransactionType.TransferQuorum ||
      tx.transactionType === TransactionType.TopUpQuorum
    ) {
      const t = tx as TransferQuorumTransaction
      rawAmount = t.amount
      tokenAddress = ICP_CANISTER_ID
    }

    if (rawAmount === undefined || !tokenAddress) return

    const token = tokens.find((t) => t.getTokenAddress() === tokenAddress)
    if (!token) return

    const amount = new BigNumber(rawAmount)
      .dividedBy(10 ** token.getTokenDecimals())
      .toFixed(token.getTokenDecimals())
      .replace(TRIM_ZEROS, "")

    return {
      amount: `${amount} ${token.getTokenSymbol()}`,
      usdAmount: token.getTokenRateFormatted(amount),
    }
  }, [tokens, tx, isBatch])

  return (
    <div
      className={clsx(
        "grid gap-2.5 items-center dark:text-white sm:px-[30px]",
        "hover:bg-gray-50 dark:hover:bg-zinc-700 transition-bg duration-200 cursor-pointer",
        "grid-cols-[50fr_25fr_25fr] lg:grid-cols-[23.34fr_11.11fr_41.35fr_14.20fr_10fr]",
      )}
      onClick={() => setChosenTransaction(txGroup)}
    >
      <div className="flex items-center gap-3 min-h-[64px]">
        <div
          className={clsx(
            "rounded-[12px] w-10 h-10 flex items-center justify-center",
            isBatch
              ? "bg-indigo-50 dark:bg-indigo-900"
              : getTxMarkupByType(tx)?.bg,
            tx.state !== TransactionState.Pending &&
              tx.state !== TransactionState.Blocked &&
              "!bg-gray-50 dark:!bg-zinc-800",
          )}
        >
          {isBatch ? getTxMarkupByType(tx)?.icon : getTxMarkupByType(tx)?.icon}
        </div>
        <div className="leading-5">
          <p className="text-sm font-semibold">
            {isCreateVault
              ? "Create NFID Vault"
              : isBatch
                ? "Batch transaction"
                : getTxMarkupByType(tx)?.title}
          </p>
          {tx.state !== TransactionState.Pending && (
            <p className="mt-0.5 text-secondary dark:text-zinc-500 text-xs font-normal">
              {vaultTxTimestampToTime(tx.createdDate)}
            </p>
          )}
        </div>
      </div>
      <div className="hidden text-sm leading-5 lg:block">
        {isBatch
          ? `#${sortedGroup[0].id}–${sortedGroup[sortedGroup.length - 1].id}`
          : `#${tx.id}`}
      </div>
      <div className="hidden text-sm lg:block">
        {isBatch
          ? txGroup.map((t, i, arr) => (
              <span key={t.id.toString()}>
                {getTxMarkupByType(t)?.title}
                {i < arr.length - 1 && " | "}
              </span>
            ))
          : getTxMarkupByType(
              tx,
              vaultId,
              tokens,
              members,
              xdrPermyriadPerIcp,
              allTransactions,
            )?.info}
      </div>
      <div className="text-sm lg:pl-5">
        {tokenAmount && (
          <div>
            <p className="text-sm leading-6">{tokenAmount.amount}</p>
            <p className="text-xs leading-5 text-gray-400">
              {tokenAmount.usdAmount}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2.5 text-sm">
        {tx.state === TransactionState.Pending ||
        tx.state === TransactionState.Blocked ? (
          <>
            <p className="text-sm leading-5">
              {tx.approves.length}/{tx.threshold || quorum}
            </p>
            <div className="ml-2 text-black dark:text-white">
              <IconWallet />
            </div>
          </>
        ) : (
          <p
            className={clsx(
              "tracking-[0.6px] leading-4 text-sm",
              (tx.state === TransactionState.Executed ||
                tx.state === TransactionState.Purged) &&
                "text-emerald-600",
              (tx.state === TransactionState.Rejected ||
                tx.state === TransactionState.Failed) &&
                "text-red-600",
            )}
          >
            {tx.state}
          </p>
        )}
      </div>
    </div>
  )
}
