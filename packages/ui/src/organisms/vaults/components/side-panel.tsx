 
import clsx from "clsx"
import { motion } from "framer-motion"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { Button } from "packages/ui/src/molecules/button"
import { ArrowButton } from "packages/ui/src/molecules/button/arrow-button"
import { useDisableScroll } from "packages/ui/src/molecules/modal/hooks/disable-scroll"
import { FC, useState } from "react"
import {
  getBatchSidePanelContent,
  getSidePanelMarkupByType,
  isCreateVaultGroup,
} from "../utils"
import { VaultSidePanelProps } from "../types"

export const VaultSidePanel: FC<VaultSidePanelProps> = ({
  isOpen,
  onClose,
  txGroup,
  vaultId,
  tokens,
  members,
  xdrPermyriadPerIcp,
}) => {
  const isBatch = (txGroup?.length ?? 0) > 1
  const isCreateVault = txGroup ? isCreateVaultGroup(txGroup) : false
  const tx = txGroup?.[0] ?? null
  const [isLoading, setIsLoading] = useState(false)
  useDisableScroll(isOpen)

  return (
    <div>
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-48 left-0 top-0",
          "w-screen h-screen",
          !isOpen && "hidden",
        )}
      />
      <div
        className={clsx(
          "w-[90vw] md:w-[600px] h-screen fixed top-0 right-0 transition-all duration-500",
          "bg-white dark:bg-darkGray shadow-[0px_4px_40px_rgba(0,0,0,0.2)] z-[49] transform p-[30px] overflow-auto",
          !isOpen ? "translate-x-[800px]" : "translate-x-0",
        )}
      >
        {!tx ? null : (
          <>
            <div className="flex items-center justify-between h-[70px]">
              <div className="flex space-x-2.5 items-center">
                <ArrowButton
                  buttonClassName="py-[7px] dark:hover:bg-zinc-700"
                  onClick={onClose}
                  iconClassName="text-black dark:text-white"
                />
                <p className="text-[28px] dark:text-white">
                  {isCreateVault
                    ? "Create NFID Vault"
                    : isBatch
                      ? "Batch transaction"
                      : getSidePanelMarkupByType(tx)?.title}
                </p>
              </div>
              <div className={clsx("leading-4 text-sm tracking-[0.6%]")}></div>
            </div>
            <motion.div
              key="StakingPanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {isBatch ? (
                <div>
                  {getBatchSidePanelContent(
                    txGroup!,
                    vaultId,
                    tokens,
                    members,
                    xdrPermyriadPerIcp,
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] py-[20px] relative">
                  <div>
                    <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 dark:text-zinc-500">
                          Transaction number
                        </p>
                      </div>
                      <div className="dark:text-white">{tx.id.toString()}</div>
                    </div>
                    {!isCreateVault && (
                      <>
                        <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                        {
                          getSidePanelMarkupByType(
                            tx,
                            vaultId,
                            tokens,
                            members,
                            xdrPermyriadPerIcp,
                          )?.info
                        }
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="border border-gray-200 dark:border-zinc-700 rounded-3xl px-[30px] pb-[30px] pt-[16px] mt-5">
                <div className="text-[24px] leading-[50px] mb-[10px] dark:text-white">
                  Details
                </div>
                <div className="grid grid-cols-[160px_1fr] text-sm items-center h-[54px]">
                  <p className="text-gray-400 dark:text-zinc-500">
                    Date created
                  </p>
                  <div>
                    <p className="dark:text-white">123</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      456
                    </p>
                  </div>
                </div>
                {true && (
                  <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                )}
                <div className="w-full h-[1px] w-full h-[1px] bg-gray-200 dark:bg-zinc-700" />
                <Button
                  icon={
                    isLoading ? (
                      <Spinner className="w-5 h-5 text-gray-300 dark:text-white" />
                    ) : null
                  }
                  disabled={isLoading}
                  onClick={() => 1}
                  className={clsx("w-full mt-[20px]")}
                >
                  Approve
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
