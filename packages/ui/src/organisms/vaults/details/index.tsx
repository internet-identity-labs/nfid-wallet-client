/* eslint-disable @nx/enforce-module-boundaries */
import { FC, memo, useMemo } from "react"

import ProfileContainer from "../../../atoms/profile-container/Container"
import { Button, NotFound } from "@nfid-frontend/ui"
import { TransactionState, TransactionType } from "@nfid/vaults"
import { VaultSkeleton } from "../../../atoms/skeleton/vault-skeleton"
import { VaultProfileInfo } from "../../profile-info"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useNavigate } from "react-router-dom"
import { VaultTableRow } from "../components/vault-table"
import { VaultDetailstProps } from "../types"

export const VaultDetails: FC<VaultDetailstProps> = memo(
  ({
    address,
    vault,
    refreshPortfolio,
    isLoading,
    isUsdLoading,
    usdBalance,
  }) => {
    const navigate = useNavigate()
    const state = vault?.state
    const transactions = vault?.transactions

    const pendingTransactions = useMemo(() => {
      if (!transactions) return
      return transactions.filter((tx) => tx.state === TransactionState.Pending)
    }, [transactions])

    const recentTransactions = useMemo(() => {
      if (!transactions) return
      return transactions.filter(
        (tx) =>
          tx.state === TransactionState.Executed ||
          tx.state === TransactionState.Rejected,
      )
    }, [transactions])

    // const addmember = useMemo(() => {
    //   if (!transactions) return
    //   return transactions.filter(
    //     (tx) => tx.transactionType === TransactionType.MemberCreateV2,
    //   )
    // }, [transactions])

    if (isLoading) return <VaultSkeleton />
    if (!vault) return <NotFound hideNavigation />

    return (
      <div className="my-[30px] font-inter">
        <VaultProfileInfo
          usdBalance={usdBalance}
          isUsdLoading={isUsdLoading}
          onSendClick={() => 1}
          onReceiveClick={() => 1}
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
                {pendingTransactions?.length}
              </p>
            </div>
          }
          titleClassName="dark:text-white !px-0 !text-[24px]"
          className="p-0 sm:p-[30px] sm:!border mt-2.5 sm:mt-[30px] mb-5 sm:mb-[30px] sm:py-5"
          innerClassName="!p-0"
        >
          <div className="mt-[12px] sm:mt-[22px]">
            {pendingTransactions?.length ? (
              <div
                className="grid gap-2.5 items-center dark:text-white"
                style={{
                  gridTemplateColumns:
                    //"24.14fr 11.49fr 16.09fr 18.39fr 22.99fr 6.9fr",
                    "23.34fr 11.11fr 15.56fr 17.79fr 22.20fr 10fr",
                }}
              >
                {pendingTransactions?.map((tx, index) => (
                  <VaultTableRow tx={tx} key={`group_${tx.id}`} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] leading-[18px] text-gray-600 dark:text-zinc-500 mb-2.5">
                No transactions to approve.
              </p>
            )}
          </div>
        </ProfileContainer>
        <ProfileContainer
          title="Recent transactions"
          titleButton={
            <Button
              className="font-bold text-sm leading-[22px]"
              type="ghost"
              onClick={() => navigate(ProfileConstants.vaultTransaction)}
            >
              View all
            </Button>
          }
          titleClassName="dark:text-white !px-0 !text-[24px] !mb-0"
          className="p-0 sm:p-[30px] sm:!border mt-2.5 sm:mt-[30px] mb-5 sm:mb-[30px] sm:py-5"
          innerClassName="!p-0"
        >
          <div
            className="grid gap-2.5 items-center dark:text-white mt-[30px]"
            style={{
              gridTemplateColumns:
                //"24.14fr 11.49fr 16.09fr 18.39fr 22.99fr 6.9fr",
                "23.34fr 11.11fr 15.56fr 17.79fr 22.20fr 10fr",
            }}
          >
            {recentTransactions?.map((tx, index) => (
              <VaultTableRow tx={tx} key={`group_${tx.id}`} />
            ))}
          </div>
        </ProfileContainer>
        <div className="flex items-center gap-1.5 mt-5 sm:mt-[30px]">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
          <div className="text-xs leading-5 text-gray-400 dark:text-zinc-400">
            {address}
          </div>
        </div>
      </div>
    )
  },
)
