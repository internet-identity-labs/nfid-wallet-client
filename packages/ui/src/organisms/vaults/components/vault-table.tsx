/* eslint-disable @nx/enforce-module-boundaries */
import { format } from "date-fns"
import {
  groupTransactionsByBatch,
  mergeCreateVaultGroup,
  vaultTxTimestampToDate,
  getDepositRowMarkup,
  groupItemsByDate,
  getItemTimestampMs,
} from "../utils"
import {
  TableItem,
  VaultDeposit,
  VaultTableProps,
  VaultTableType,
} from "../types"
import { VaultTableRow } from "./vault-table-row"
import { FT } from "frontend/integration/ft/ft"
import clsx from "clsx"

export const VaultTable = ({
  transactions,
  setChosenTransaction,
  setChosenDeposit,
  vaultId,
  tokens,
  tableType,
  limit,
  members,
  xdrPermyriadPerIcp,
  quorum,
  deposits,
  allTransactions,
}: VaultTableProps) => {
  const groups = mergeCreateVaultGroup(
    groupTransactionsByBatch(transactions),
  ).sort((a, b) =>
    Number(
      Math.max(...b.map((t) => Number(t.modifiedDate))) -
        Math.max(...a.map((t) => Number(t.modifiedDate))),
    ),
  )

  if (!(
    tableType === VaultTableType.RECENT || tableType === VaultTableType.ALL
  )) {
    const limited = groups.slice(0, limit)
    return (
      <>
        <div className="mt-[30px] mb-2.5 font-bold text-sm leading-5 text-gray-400 dark:text-zinc-400 sm:px-[30px]">
          {tableType === VaultTableType.PENDING && "Active"}
          {tableType === VaultTableType.BLOCKED && "Queue"}
        </div>
        <div>
          {limited.map((txGroup) => (
            <VaultTableRow
              setChosenTransaction={setChosenTransaction}
              txGroup={txGroup}
              vaultId={vaultId}
              tokens={tokens}
              members={members}
              xdrPermyriadPerIcp={xdrPermyriadPerIcp}
              quorum={quorum}
              allTransactions={allTransactions}
              key={`vault-tx-${txGroup[0].id}`}
            />
          ))}
        </div>
      </>
    )
  }

  const txItems: TableItem[] = groups.map((g) => ({ kind: "tx", group: g }))
  const depositItems: TableItem[] = (deposits ?? []).map((d) => ({
    kind: "deposit",
    deposit: d,
  }))

  const allItems = [...txItems, ...depositItems]
    .sort((a, b) => getItemTimestampMs(b) - getItemTimestampMs(a))
    .slice(0, limit)

  return (
    <>
      {groupItemsByDate(allItems).map(({ date, rows }, i) => (
        <div key={date}>
          <p
            className={clsx(
              "mb-2.5 font-bold text-sm leading-5 text-gray-400 dark:text-zinc-400 sm:px-[30px]",
              i === 0 ? "mt-[30px]" : "mt-5",
            )}
          >
            {date}
          </p>
          {rows.map((item) =>
            item.kind === "tx" ? (
              <VaultTableRow
                setChosenTransaction={setChosenTransaction}
                txGroup={item.group}
                vaultId={vaultId}
                tokens={tokens}
                key={`vault-tx-${item.group[0].id}`}
                members={members}
                xdrPermyriadPerIcp={xdrPermyriadPerIcp}
                allTransactions={allTransactions}
              />
            ) : (
              <DepositRow
                deposit={item.deposit}
                vaultId={vaultId}
                tokens={tokens}
                onClick={() => setChosenDeposit?.(item.deposit)}
                key={`deposit-${item.deposit.id}`}
              />
            ),
          )}
        </div>
      ))}
    </>
  )
}

const DepositRow = ({
  deposit,
  vaultId,
  tokens,
  onClick,
}: {
  deposit: VaultDeposit
  vaultId?: string
  tokens?: FT[]
  onClick: () => void
}) => {
  const markup = getDepositRowMarkup(deposit, vaultId, tokens)

  return (
    <div
      className={clsx(
        "grid gap-2.5 items-center dark:text-white sm:px-[30px]",
        "hover:bg-gray-50 dark:hover:bg-zinc-700 transition-bg duration-200 cursor-pointer",
        "grid-cols-[50fr_25fr_25fr] lg:grid-cols-[23.34fr_11.11fr_41.35fr_14.20fr_10fr]",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-h-[64px]">
        <div
          className={clsx(
            "rounded-[12px] w-10 h-10 flex items-center justify-center",
            markup.bg,
          )}
        >
          {markup.icon}
        </div>
        <div className="leading-5">
          <p className="text-sm font-semibold">{markup.title}</p>
          <p className="mt-0.5 text-secondary dark:text-zinc-500 text-xs font-normal">
            {format(deposit.timestamp, "hh:mm:ss aa").toLowerCase()}
          </p>
        </div>
      </div>
      <div className="hidden text-sm leading-5 lg:block"></div>
      <div className="hidden text-sm lg:block">{markup.info}</div>
      <div className="text-sm lg:pl-5">
        {markup.amount && (
          <div>
            <p className="text-sm leading-6">{markup.amount}</p>
            {markup.usdAmount && (
              <p className="text-xs leading-5 text-gray-400">
                {markup.usdAmount}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end text-sm">
        <p className="tracking-[0.6px] leading-4 text-sm text-emerald-600">
          Executed
        </p>
      </div>
    </div>
  )
}
