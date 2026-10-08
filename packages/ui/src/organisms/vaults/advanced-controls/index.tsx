import { FC, memo, useState } from "react"
import { Button, Copy, NotFound } from "@nfid-frontend/ui"
import { VaultAdvancedControlsProps } from "../types"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { ControllersModal } from "../components/controllers-modal"
import { VaultSkeleton } from "packages/ui/src/atoms/skeleton/vault-skeleton"
import { TopUpModal } from "../components/top-up-modal"
import { PurgeModal } from "../components/purge-modal"

export const VaultAdvancedControls: FC<VaultAdvancedControlsProps> = memo(
  ({
    updateControllers,
    validateAddress,
    controllers,
    isLoading,
    purge,
    vaultId,
    cyclesBalance,
    topUp,
    xdrPermyriadPerIcp,
    vaultIcpBalance,
  }) => {
    const [isControllersModalOpen, setIsControllersModalOpen] = useState(false)
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
    const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false)

    const [isPurging, setIsPurging] = useState(false)

    const onPurge = async () => {
      setIsPurging(true)
      await purge()
      setIsPurging(false)
    }

    if (!controllers && isLoading) return <VaultSkeleton />
    if (!controllers) return <NotFound hideNavigation />

    return (
      <>
        <PurgeModal
          isOpen={isPurgeModalOpen}
          onClose={() => setIsPurgeModalOpen(false)}
          purge={onPurge}
        />
        <TopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          vaultId={vaultId}
          topUp={topUp}
          xdrPermyriadPerIcp={xdrPermyriadPerIcp}
          vaultIcpBalance={vaultIcpBalance}
        />
        <ControllersModal
          isOpen={isControllersModalOpen}
          onClose={() => setIsControllersModalOpen(false)}
          validateAddress={validateAddress}
          updateControllers={updateControllers}
          controllers={controllers}
        />
        <ProfileContainer
          className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
          innerClassName="!px-[20px] md:!px-[30px]"
          title="Controllers"
          titleClassName="px-[20px] md:px-[30px] mb-5 text-[24px] leading-5"
        >
          <div className="md:flex gap-5 py-[14px]">
            <p className="mb-5 text-sm leading-5 text-secondary dark:tex-zinc-500 basis-[140px]">
              Controller IDs
            </p>
            <div className="flex flex-col gap-1.5 leading-5 text-sm">
              {controllers?.map((c) => (
                <p key={c}>{c}</p>
              ))}
            </div>
            <Button
              className="block mt-5 ml-auto mr-auto text-sm font-bold md:mt-0 md:mr-0"
              isSmall
              type="ghost"
              onClick={() => setIsControllersModalOpen(true)}
            >
              Edit
            </Button>
          </div>
        </ProfileContainer>
        <ProfileContainer
          className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
          innerClassName="!px-[20px] md:!px-[30px]"
          title="Master override"
          titleClassName="px-[20px] md:px-[30px] mb-5 text-[24px] leading-5"
        >
          <div className="gap-5 md:flex">
            <p className="leading-[22px] text-sm">
              Assuming quorum approval, the master override will cancel all
              transactions in your queue.
            </p>
            <Button
              className="block mt-5 ml-auto mr-auto text-sm font-bold !text-red-600 md:mt-0 md:mr-0"
              isSmall
              disabled={isPurging}
              type="ghost"
              onClick={() => setIsPurgeModalOpen(true)}
            >
              Clear queue
            </Button>
          </div>
        </ProfileContainer>
        <ProfileContainer
          className="!py-[20px] md:!py-[30px] !border !mb-[20px] md:!mb-[30px] dark:text-white"
          innerClassName="!px-[20px] md:!px-[30px]"
          title="Cycles balance"
          titleClassName="px-[20px] md:px-[30px] mb-5 text-[24px] leading-5"
        >
          <div className="md:flex items-center gap-5 py-[14px]">
            <p className="mb-5 md:mb-0 text-sm leading-5 text-secondary dark:tex-zinc-500 basis-[140px]">
              Canister ID
            </p>
            <div className="flex items-center gap-1.5 leading-5 text-sm">
              {vaultId}
              <Copy
                className="md:ml-auto md:hidden"
                iconClassName="text-black dark:text-white stroke-black dark:stroke-white"
                value={vaultId!}
              />
            </div>
            <Copy
              className="hidden md:block md:ml-auto"
              iconClassName="text-black dark:text-white stroke-black dark:stroke-white"
              value={vaultId!}
            />
          </div>
          <div className="md:flex items-center gap-5 py-[14px]">
            <p className="mb-5 md:mb-0 text-sm leading-5 text-secondary dark:tex-zinc-500 basis-[140px]">
              Cycles
            </p>
            <div className="flex flex-col gap-1.5 leading-5 text-sm text-orange-600">
              {cyclesBalance}
            </div>
            <Button
              isSmall
              className="block mt-5 ml-auto mr-auto text-sm font-bold md:mt-0 md:mr-0"
              type="ghost"
              onClick={() => setIsTopUpModalOpen(true)}
            >
              Top-up
            </Button>
          </div>
        </ProfileContainer>
      </>
    )
  },
)
