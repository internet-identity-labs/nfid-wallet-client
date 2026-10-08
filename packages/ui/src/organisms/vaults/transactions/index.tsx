 
import { FC, memo, useMemo, useState } from "react"
import ProfileContainer from "../../../atoms/profile-container/Container"
import { NotFound } from "@nfid-frontend/ui"
import { VaultSkeleton } from "../../../atoms/skeleton/vault-skeleton"
import { VaultTableType, VaultTransactionsProps } from "../types"
import { Transaction, TransactionState } from "@nfid/vaults"
import { VaultTable } from "../components/vault-table"
import { VaultSidePanel } from "../components/side-panel"

export const VaultTransactions: FC<VaultTransactionsProps> = memo(
  ({ vaultId, vault, tokens, isLoading, xdrPermyriadPerIcp }) => {
    const [sidePanelTx, setSidePanelTx] = useState<Transaction[] | null>(null)
    const transactions = vault?.transactions

    const allTransactions = useMemo(() => {
      if (!transactions) return
      return transactions.filter(
        (tx) =>
          tx.state === TransactionState.Executed ||
          tx.state === TransactionState.Rejected ||
          tx.state === TransactionState.Failed ||
          tx.state === TransactionState.Purged,
      )
    }, [transactions])

    if (isLoading) return <VaultSkeleton />
    if (!vault) return <NotFound hideNavigation />

    return (
      <>
        <VaultSidePanel
          isOpen={Boolean(sidePanelTx)}
          onClose={() => setSidePanelTx(null)}
          txGroup={sidePanelTx}
          vaultId={vaultId}
          tokens={tokens}
          members={vault?.state.members}
          xdrPermyriadPerIcp={xdrPermyriadPerIcp}
        />
        <ProfileContainer
          titleClassName="dark:text-white !px-0 !text-[24px] sm:!mb-[-30px]"
          className="p-0 sm:py-[30px] sm:!border mt-2.5 sm:mt-[30px] mb-5 sm:mb-[30px] sm:py-5"
          innerClassName="!p-0"
        >
          {!allTransactions?.length ? (
            <p className="text-[13px] leading-[18px] text-gray-600 dark:text-zinc-500 mb-2.5">
              No recent transactions.
            </p>
          ) : (
            <VaultTable
              transactions={allTransactions}
              setChosenTransaction={setSidePanelTx}
              vaultId={vaultId}
              tokens={tokens}
              tableType={VaultTableType.ALL}
              members={vault?.state.members}
              xdrPermyriadPerIcp={xdrPermyriadPerIcp}
            />
          )}
        </ProfileContainer>
      </>
    )
  },
)
