import { SignIdentity } from "@icp-sdk/core/agent"
import clsx from "clsx"
import { useCallback } from "react"
import { FT } from "frontend/integration/ft/ft"
import { Transaction, TransactionState, TransactionType } from "@nfid/vaults"
import { HexagonIcon } from "packages/ui/src/atoms/icons/hexagon"
import { vaultTxTimestampToTime } from "../utils"
import { IconWallet } from "packages/ui/src/atoms/icons/wallet"

interface VaultTableRowProps {
  tx: Transaction
}

// Requires approval Active -> TransactionState.Pending
// Requires approval Queue -> TransactionState.Blocked

// all other states -> Recent transactions

export const getTxMarkupByType = (
  type: TransactionType,
  state: TransactionState,
) => {
  switch (type) {
    case TransactionType.VaultNamingUpdate:
      // rely on txId 1, when showing "Create NFID Vault"
      // MemberCreateV2 -> VaultNamingUpdate
      return {
        title: "Vault name update",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }
    case TransactionType.MemberCreateV2:
      // show name
      return {
        title: "Add approver",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }

    case TransactionType.MemberRemove:
      // show name
      return {
        title: "Remove approver",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }

    case TransactionType.QuorumUpdate:
      return {
        title: "Update approval threshold",
        // show prevQuorum -> newQuorum
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }
    case TransactionType.ICRC1AddCanisters:
      // show Token name -> token symbol -> token ledger
      return {
        title: "Import asset",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }
    case TransactionType.ICRC1RemoveCanisters:
      // show Token name -> token symbol -> token ledger
      return {
        title: "Remove asset",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }
    case TransactionType.ControllerUpdate:
      // show full list of controlles before TX -
      return {
        title: "Edit controllers",
        icon: (
          <HexagonIcon
            className={clsx(
              "text-indigo-600 dark:text-indigo-400",
              state !== TransactionState.Pending &&
                "!text-gray-400 dark:!text-zinc-400",
            )}
          />
        ),
        bg: "bg-indigo-50 dark:bg-indigo-900",
      }

    default:
      return null
  }
}

export const VaultTableRow = ({ tx }: VaultTableRowProps) => {
  console.log(tx.state)
  return (
    <>
      <div className="flex items-center gap-3 h-[64px]">
        <div
          className={clsx(
            "bg-indigo-50 dark:bg-indigo-900 rounded-[12px] w-10 h-10 flex items-center justify-center",
            getTxMarkupByType(tx.transactionType, tx.state)?.bg,
            tx.state !== TransactionState.Pending &&
              "!bg-gray-50 dark:!bg-zinc-800",
          )}
        >
          {getTxMarkupByType(tx.transactionType, tx.state)?.icon}
        </div>
        <div className="leading-5">
          <p className="text-sm font-semibold">
            {getTxMarkupByType(tx.transactionType, tx.state)?.title}
          </p>
          {tx.state !== TransactionState.Pending && (
            <p className="mt-0.5 text-secondary dark:text-zinc-500 text-xs font-normal">
              {vaultTxTimestampToTime(tx.createdDate)}
            </p>
          )}
        </div>
      </div>
      <div className="text-sm leading-5">#{tx.id}</div>
      <div>{2}</div>
      <div>4</div>
      <div>5</div>
      <div className="flex items-center justify-end gap-2.5">
        {tx.state === TransactionState.Pending ? (
          <>
            <p className="text-sm leading-5">
              {tx.approves.length}/{tx.threshold}
            </p>
            <div className="ml-2 text-black dark:text-white">
              <IconWallet />
            </div>
          </>
        ) : (
          <p
            className={clsx(
              "tracking-[0.6px] leading-4 text-sm",
              tx.state === TransactionState.Executed && "text-emerald-600",
              tx.state === TransactionState.Rejected && "text-red-600",
            )}
          >
            {tx.state}
          </p>
        )}
      </div>
    </>
  )
}
