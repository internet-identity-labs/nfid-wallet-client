import clsx from "clsx"
import React, { Dispatch, SetStateAction, useCallback, useState } from "react"
import { toast } from "react-toastify"

import { IconCmpArchive, ModalAdvanced } from "@nfid-frontend/ui"
import { ObjectState, updateWallet, Wallet } from "@nfid/integration"

import { useVaultWallets } from "frontend/features/vaults/hooks/use-vault-wallets"

interface VaultArchiveWalletProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedWallet?: Wallet
}

export const VaultArchiveWallet: React.FC<VaultArchiveWalletProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedWallet,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { refetch } = useVaultWallets()

  const onArchiveMember = useCallback(async () => {
    if (!selectedWallet) return

    try {
      setIsLoading(true)
      await updateWallet({
        ...selectedWallet,
        state: ObjectState.ARCHIVED,
      })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success("Wallet archived")
      await refetch()
    }
  }, [refetch, selectedWallet, setIsModalOpen])

  return (
    <ModalAdvanced
      large
      title="Archive wallet"
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "red",
        text: "Archive",
        onClick: onArchiveMember,
      }}
    >
      <div className="flex items-start gap-5">
        <div
          className={clsx(
            "w-16 h-16 flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-red-50 to-white rounded-3xl",
          )}
        >
          <IconCmpArchive className="text-red-500 w-7" />
        </div>
        <p className="text-sm">
          This wallet, along with its policies and transactions, will be
          excluded from your Vault pages.
          <br />
          <br />
          Archive <strong>{selectedWallet?.name}</strong>?
        </p>
      </div>
    </ModalAdvanced>
  )
}
