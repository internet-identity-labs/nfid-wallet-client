/* eslint-disable @nx/enforce-module-boundaries */
import { FC, memo, useState } from "react"
import ProfileContainer from "../../../atoms/profile-container/Container"
import { Button, IconCmpWarning, NotFound } from "@nfid-frontend/ui"
import { VaultSkeleton } from "../../../atoms/skeleton/vault-skeleton"
import { VaultProfileInfo } from "../../profile-info"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useNavigate } from "react-router-dom"
import { VaultDetailstProps } from "../types"
import clsx from "clsx"
import { TopUpModal } from "../components/top-up-modal"

export const VaultDetails: FC<VaultDetailstProps> = memo(
  ({
    address,
    vault,
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
  }) => {
    const navigate = useNavigate()
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
    const state = vault?.state

    if (isLoading) return <VaultSkeleton />
    if (!vault) return <NotFound hideNavigation />

    return (
      <>
        <TopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          vaultId={address}
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
          <div className="flex items-center gap-1.5 mt-5 sm:mt-[30px]">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
            <div className="text-xs leading-5 text-gray-400 dark:text-zinc-400">
              {address}
            </div>
          </div>
        </div>
      </>
    )
  },
)
