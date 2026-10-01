/* eslint-disable @nx/enforce-module-boundaries */
import { FC, memo } from "react"
import ProfileContainer from "../../../atoms/profile-container/Container"
import { Button, NotFound } from "@nfid-frontend/ui"
import { VaultSkeleton } from "../../../atoms/skeleton/vault-skeleton"
import { VaultProfileInfo } from "../../profile-info"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useNavigate } from "react-router-dom"
import { VaultDetailstProps } from "../types"

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
  }) => {
    const navigate = useNavigate()
    const state = vault?.state

    if (isLoading) return <VaultSkeleton />
    if (!vault) return <NotFound hideNavigation />

    return (
      <div className="my-[30px] font-inter">
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
    )
  },
)
