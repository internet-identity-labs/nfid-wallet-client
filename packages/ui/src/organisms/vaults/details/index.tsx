/* eslint-disable @nx/enforce-module-boundaries */
import { FC, memo, useMemo, useState } from "react"
import ProfileContainer from "../../../atoms/profile-container/Container"
import {
  Button,
  CopyAddress,
  IconCmpWarning,
  NotFound,
} from "@nfid-frontend/ui"
import { VaultSkeleton } from "../../../atoms/skeleton/vault-skeleton"
import { VaultProfileInfo } from "../../profile-info"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useNavigate } from "react-router-dom"
import { VaultDeposit, VaultDetailsProps, VaultTableType } from "../types"
import clsx from "clsx"
import { TopUpModal } from "../components/top-up-modal"
import { Transaction, TransactionState } from "@nfid/vaults"
import { VaultTable } from "../components/vault-table"
import { VaultSidePanel } from "../components/side-panel"

export const VaultDetails: FC<VaultDetailsProps> = memo(
  ({
    vaultId,
    vault,
    tokens,
    refreshPortfolio,
    isLoading,
    isUsdLoading,
    usdBalance,
    onSendClick,
    onReceiveClick,
    isLowCyclesBalance,
    xdrPermyriadPerIcp,
    topUp,
    vaultIcpBalance,
    deposits,
    approve,
    reject,
  }) => {
    const navigate = useNavigate()
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
    const [sidePanelTx, setSidePanelTx] = useState<Transaction[] | null>(null)
    const [sidePanelDeposit, setSidePanelDeposit] =
      useState<VaultDeposit | null>(null)
    const state = vault?.state
    const transactions = vault?.transactions

    const pendingTransactions = useMemo(() => {
      if (!transactions) return
      return transactions.filter((tx) => tx.state === TransactionState.Pending)
    }, [transactions])

    const blockedTransactions = useMemo(() => {
      if (!transactions) return
      return transactions.filter((tx) => tx.state === TransactionState.Blocked)
    }, [transactions])

    const recentTransactions = useMemo(() => {
      if (!transactions) return
      return transactions
        .filter(
          (tx) =>
            tx.state === TransactionState.Executed ||
            tx.state === TransactionState.Rejected ||
            tx.state === TransactionState.Failed ||
            tx.state === TransactionState.Purged,
        )
        .sort((a, b) => Number(b.modifiedDate - a.modifiedDate))
    }, [transactions])

    const closePanel = () => {
      setSidePanelTx(null)
      setSidePanelDeposit(null)
    }

    if (isLoading) return <VaultSkeleton />
    if (!vault) return <NotFound hideNavigation />

    return (
      <>
        <VaultSidePanel
          isOpen={Boolean(sidePanelTx) || Boolean(sidePanelDeposit)}
          onClose={closePanel}
          txGroup={sidePanelTx}
          deposit={sidePanelDeposit}
          vaultId={vaultId}
          tokens={tokens}
          members={vault?.state.members}
          xdrPermyriadPerIcp={xdrPermyriadPerIcp}
          quorum={vault?.state.quorum.quorum}
          approve={approve}
          reject={reject}
        />
        <TopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          vaultId={vaultId}
          topUp={topUp}
          xdrPermyriadPerIcp={xdrPermyriadPerIcp}
          vaultIcpBalance={vaultIcpBalance}
        />
        <div className="my-[30px] font-inter">
          {isLowCyclesBalance && (
            <div
              className={clsx(
                "flex flex-wrap md:flex-nowrap md:items-center gap-2.5 py-5 px-5 md:px-[30px] md:py-[21px] mb-[30px] rounded-[12px]",
                "bg-orange-50 dark:bg-orange-500/10 text-orange-900 dark:text-amber-600",
              )}
            >
              <IconCmpWarning className="inline-block align-middle mr-2.5 md:mr-0 w-6 h-6 text-orange-900 min-w-6 dark:text-amber-600" />
              <p className="inline-block align-middle">
                Your vault is low on cycles and requires topping-up to prevent
                downtime.
              </p>
              <Button
                className="md:w-auto md:ml-auto text-sm font-bold !text-orange-900 dark:!text-amber-600"
                isSmall
                type="ghost"
                onClick={() => setIsTopUpModalOpen(true)}
              >
                Top-up
              </Button>
            </div>
          )}
          <VaultProfileInfo
            usdBalance={usdBalance}
            isUsdLoading={isUsdLoading}
            onSendClick={onSendClick}
            onReceiveClick={onReceiveClick}
            refreshPortfolio={refreshPortfolio}
            goToPortfolio={() => navigate(ProfileConstants.vaultPortfolio)}
          />
          <ProfileContainer
            title="Security policy"
            titleButton={
              <Button
                className="font-bold text-sm leading-[22px]"
                type="ghost"
                onClick={() => navigate(ProfileConstants.vaultPolicy)}
              >
                Manage
              </Button>
            }
            titleClassName="dark:text-white !px-0 !text-[24px]"
            className="p-4 sm:p-[30px] !border mt-2.5 sm:mt-[30px] mb-5 sm:mb-[30px] py-5"
            innerClassName="!p-0"
          >
            <div className="mt-[12px] sm:mt-[22px] flex">
              <div className="basis-[50%] sm:basis-[320px]">
                <p className="mb-2 sm:mb-[20px] text-sm font-bold leading-5 text-gray-400 dark:text-zinc-500">
                  Approvers
                </p>
                <p className="font-semibold text-[22px] sm:text-[28px] leading-5 dark:text-white">
                  {state?.members.length}
                </p>
              </div>
              <div className="basis-[50%] sm:basis-auto">
                <p className="mb-2 sm:mb-[20px] text-sm font-bold leading-5 text-gray-400 dark:text-zinc-500">
                  Approval threshold
                </p>
                <p className="font-semibold text-[22px] sm:text-[28px] leading-5 dark:text-white">
                  {state?.quorum.quorum}/{state?.members.length}
                </p>
              </div>
            </div>
          </ProfileContainer>
          <ProfileContainer
            title="Requires approval"
            titleLabel={
              <div className="py-0.5 px-3 rounded-[12px] bg-black dark:bg-white ml-5 mr-auto min-w-[34px] text-center">
                <p className="text-sm font-bold leading-5 text-white dark:text-black">
                  {(pendingTransactions?.length ?? 0) +
                    (blockedTransactions?.length ?? 0)}
                </p>
              </div>
            }
            titleClassName="dark:text-white !px-0 sm:!px-[30px] !text-[24px]"
            className="p-0 sm:py-[30px] sm:!border mt-2.5 sm:mt-[30px] mb-5 sm:mb-[30px] sm:py-5"
            innerClassName="!p-0"
          >
            <div className="mt-[12px] sm:mt-[22px]">
              {!(pendingTransactions?.length || blockedTransactions?.length) ? (
                <p className="text-[13px] leading-[18px] text-gray-600 dark:text-zinc-500 mb-2.5 sm:px-[30px]">
                  No transactions to approve.
                </p>
              ) : (
                <>
                  {!!pendingTransactions?.length && (
                    <VaultTable
                      transactions={pendingTransactions}
                      setChosenTransaction={setSidePanelTx}
                      vaultId={vaultId}
                      tokens={tokens}
                      tableType={VaultTableType.PENDING}
                      members={vault?.state.members}
                      quorum={vault?.state.quorum.quorum}
                    />
                  )}
                  {!!blockedTransactions?.length && (
                    <VaultTable
                      transactions={blockedTransactions}
                      setChosenTransaction={setSidePanelTx}
                      vaultId={vaultId}
                      tokens={tokens}
                      tableType={VaultTableType.BLOCKED}
                      members={vault?.state.members}
                      quorum={vault?.state.quorum.quorum}
                    />
                  )}
                </>
              )}
            </div>
          </ProfileContainer>
          <ProfileContainer
            title="Recent transactions"
            titleButton={
              <Button
                className="font-bold text-sm leading-[22px]"
                type="ghost"
                onClick={() => navigate(ProfileConstants.vaultTransactions)}
              >
                View all
              </Button>
            }
            titleClassName="dark:text-white !px-0 !text-[24px] !mb-0 sm:!px-[30px]"
            className="p-0 sm:py-[30px] sm:!border mt-2.5 sm:mt-[30px] mb-5 sm:mb-[30px] sm:py-5"
            innerClassName="!p-0"
          >
            {!recentTransactions?.length && !deposits?.length ? (
              <p className="text-[13px] leading-[18px] text-gray-600 dark:text-zinc-500 mb-2.5">
                No recent transactions.
              </p>
            ) : (
              <VaultTable
                transactions={recentTransactions ?? []}
                setChosenTransaction={setSidePanelTx}
                setChosenDeposit={setSidePanelDeposit}
                vaultId={vaultId}
                tokens={tokens}
                tableType={VaultTableType.RECENT}
                limit={5}
                members={vault?.state.members}
                xdrPermyriadPerIcp={xdrPermyriadPerIcp}
                deposits={deposits}
              />
            )}
          </ProfileContainer>
          <div className="flex items-center gap-1.5 mt-5 sm:mt-[30px]">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
            <CopyAddress
              className="text-xs leading-5 text-gray-400 dark:text-zinc-400"
              address={vaultId || ""}
            />
          </div>
        </div>
      </>
    )
  },
)
