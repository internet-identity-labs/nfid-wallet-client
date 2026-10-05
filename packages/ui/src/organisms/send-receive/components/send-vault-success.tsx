import clsx from "clsx"
import React from "react"

import { BlurredLoader, Button } from "@nfid-frontend/ui"
import { IconWalletApproved } from "packages/ui/src/atoms/icons/wallet-approved"
import { Vault } from "@nfid/vaults"
import { IconWallet } from "packages/ui/src/atoms/icons/wallet"

export interface VaultSuccessProps {
  onDone?: () => void
  isOpen: boolean
  isLoading: boolean
  vaultDetails: Vault | undefined
  initiatorName?: string
  approverNames?: string[]
}

export const SendVaultSuccessUi: React.FC<VaultSuccessProps> = ({
  onDone,
  isOpen,
  isLoading,
  vaultDetails,
  initiatorName,
  approverNames,
}) => {
  return (
    <div
      id={"success_vault_window"}
      className={clsx(
        "text-black dark:text-white w-full h-full font-inter",
        "px-5 pb-[88px] pt-[18px] absolute left-0 top-0 z-[3] bg-white dark:bg-darkGray",
        !isOpen && "hidden",
      )}
    >
      {isLoading && <BlurredLoader isLoading={true} />}
      {!isLoading && vaultDetails && (
        <>
          <div className="text-xl !font-bold leading-10 dark:text-white font-bold">
            Awaiting approval
          </div>
          <p className="mt-2 mb-5 leading-5">
            Your transaction will be processed, pending approval.
          </p>
          <div
            className={clsx(
              "overflow-auto max-h-[calc(100%-116px)] sm:max-h-[calc(100%-88px)]",
              "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
              "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
            )}
          >
            <div className="relative">
              <div className="absolute w-0.5 h-[calc(100%-24px)] bg-primaryButtonColor top-[22px] left-[9px]"></div>
              <div className="flex gap-[27px] items-center">
                <div
                  className={clsx(
                    "w-5 h-5 border-2 rounded-full border-primaryButtonColor relative",
                    "after:absolute after:w-3 after:h-3 after:rounded-full after:bg-primaryButtonColor",
                    "after:left-0 after:top-0 after:bottom-0 after:right-0 after:m-auto",
                  )}
                ></div>
                <p className="font-semibold leading-5">Initiated</p>
              </div>
              <div className="pt-[15px] pb-[22px]">
                <div className="py-[5px] flex items-center gap-1.5 text-black dark:text-white pl-[47px]">
                  <IconWalletApproved className="w-[18px] h-[18px] min-w-[18px]" />
                  <p className="overflow-hidden text-sm leading-5 whitespace-nowrap text-ellipsis">
                    {initiatorName ?? "Unknown"}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div
                className={clsx(
                  "absolute w-0.5 h-[calc(100%-24px)] top-[22px] left-[9px]",
                  vaultDetails.quorum.quorum === 1
                    ? "bg-primaryButtonColor"
                    : "bg-gray-200 dark:bg-zinc-700",
                )}
              ></div>
              <div className="flex gap-[27px] items-center">
                <div
                  className={clsx(
                    "w-5 h-5 border-2 rounded-full border-primaryButtonColor relative",
                    "after:absolute after:w-3 after:h-3 after:rounded-full after:bg-primaryButtonColor",
                    "after:left-0 after:top-0 after:bottom-0 after:right-0 after:m-auto",
                    vaultDetails.quorum.quorum > 1 && "after:hidden",
                  )}
                ></div>
                <p className="font-semibold leading-5">
                  Waiting for {vaultDetails.quorum.quorum - 1} more approval
                  {vaultDetails.quorum.quorum === 2 ? "" : "s"}
                </p>
              </div>
              <div className="pt-[15px] pb-[22px] text-secondary dark:text-zinc-500">
                {approverNames?.map((name) => (
                  <div
                    key={name}
                    className="py-[5px] flex items-center gap-1.5 pl-[47px]"
                  >
                    <IconWallet className="w-[18px] h-[18px] min-w-[18px]" />
                    <p className="overflow-hidden text-sm leading-5 whitespace-nowrap text-ellipsis">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-[27px] items-center">
              <div
                className={clsx(
                  "w-5 h-5 border-2 rounded-full border-primaryButtonColor relative",
                  "after:absolute after:w-3 after:h-3 after:rounded-full after:bg-primaryButtonColor",
                  "after:left-0 after:top-0 after:bottom-0 after:right-0 after:m-auto",
                  vaultDetails.quorum.quorum > 1 &&
                    "after:hidden border-gray-200 dark:border-zinc-700",
                )}
              ></div>
              <p className="font-semibold leading-5">Approved</p>
            </div>
          </div>
          <Button
            type="primary"
            className="absolute w-[calc(100%-40px)] left-5 bottom-5"
            onClick={onDone}
          >
            Done
          </Button>
        </>
      )}
    </div>
  )
}
