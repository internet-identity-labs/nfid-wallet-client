import {
  groupTransactionsByBatch,
  groupTransactionsByDate,
  mergeCreateVaultGroup,
} from "../utils"
import { VaultTableProps, VaultTableType } from "../types"
import { VaultTableRow } from "./vault-table-row"
import clsx from "clsx"

export const VaultTable = ({
  transactions,
  setChosenTransaction,
  vaultId,
  tokens,
  tableType,
  limit,
  members,
  xdrPermyriadPerIcp,
  quorum,
}: VaultTableProps) => {
  const groups = mergeCreateVaultGroup(groupTransactionsByBatch(transactions))
    .sort((a, b) =>
      Number(
        Math.max(...b.map((t) => Number(t.modifiedDate))) -
          Math.max(...a.map((t) => Number(t.modifiedDate))),
      ),
    )
    .slice(0, limit)

  if (!(
    tableType === VaultTableType.RECENT || tableType === VaultTableType.ALL
  )) {
    return (
      <>
        <div className="mt-[30px] mb-2.5 font-bold text-sm leading-5 text-gray-400 dark:text-zinc-400 sm:px-[30px]">
          {tableType === VaultTableType.PENDING && "Active"}
          {tableType === VaultTableType.BLOCKED && "Queue"}
        </div>
        <div>
          {groups.map((txGroup) => (
            <VaultTableRow
              setChosenTransaction={setChosenTransaction}
              txGroup={txGroup}
              vaultId={vaultId}
              tokens={tokens}
              members={members}
              xdrPermyriadPerIcp={xdrPermyriadPerIcp}
              quorum={quorum}
              key={`vault-tx-${txGroup[0].id}`}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {groupTransactionsByDate(groups).map(({ date, rows }, i) => (
        <div key={date}>
          <p
            className={clsx(
              "mb-2.5 font-bold text-sm leading-5 text-gray-400 dark:text-zinc-400 sm:px-[30px]",
              i === 0 ? "mt-[30px]" : "mt-5",
            )}
          >
            {date}
          </p>
          {rows.map((txGroup) => (
            <VaultTableRow
              setChosenTransaction={setChosenTransaction}
              txGroup={txGroup}
              vaultId={vaultId}
              tokens={tokens}
              key={`vault-tx-${txGroup[0].id}`}
              members={members}
              xdrPermyriadPerIcp={xdrPermyriadPerIcp}
            />
          ))}
        </div>
      ))}
    </>
  )
}
