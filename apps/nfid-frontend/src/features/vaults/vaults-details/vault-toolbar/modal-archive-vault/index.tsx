import clsx from "clsx"
import React, { Dispatch, SetStateAction, useCallback, useState } from "react"
import { toast } from "react-toastify"

import { IconCmpArchive, ModalAdvanced } from "@nfid-frontend/ui"
import { Vault } from "@nfid/integration"

import { useVaultWallets } from "frontend/features/vaults/hooks/use-vault-wallets"

interface VaultArchiveModalProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedVault?: Vault
}

export const VaultArchiveModal: React.FC<VaultArchiveModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedVault,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { refetch } = useVaultWallets()

  const onArchiveVault = useCallback(async () => {
    if (!selectedVault) return

    try {
      setIsLoading(true)
      // await updateVault({
      //   ...selectedVault,
      //   state: ObjectState.ARCHIVED,
      // })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success("Vault archived")
      await refetch()
    }
  }, [refetch, selectedVault, setIsModalOpen])

  return (
    <ModalAdvanced
      large
      title="Archive vault"
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "red",
        text: "Archive",
        onClick: onArchiveVault,
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
          This vault and all of its wallets, members, policies, and transactions
          will be excluded from your Vault pages.
          <br />
          <br />
          Archive <strong>{selectedVault?.name}</strong>?
        </p>
      </div>
    </ModalAdvanced>
  )
}
