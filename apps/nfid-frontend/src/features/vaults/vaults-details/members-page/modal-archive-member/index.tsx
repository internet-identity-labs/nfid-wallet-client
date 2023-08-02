import clsx from "clsx"
import React, { Dispatch, SetStateAction, useCallback, useState } from "react"
import { toast } from "react-toastify"

import { IconCmpArchive, ModalAdvanced } from "@nfid-frontend/ui"
import {
  ObjectState,
  storeMember,
  VaultMember,
  vaultsTracking,
} from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"

interface VaultArchiveMemberProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedMember?: VaultMember
}

export const VaultArchiveMember: React.FC<VaultArchiveMemberProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedMember,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { vault, refetch } = useVault()

  const onArchiveMember = useCallback(async () => {
    if (!selectedMember || !vault?.id) return

    try {
      setIsLoading(true)
      await storeMember({
        ...selectedMember,
        vaultId: BigInt(vault.id),
        memberAddress: selectedMember.userId,
        name: selectedMember.name ?? "",
        state: ObjectState.ARCHIVED,
      })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success("Vault member archived")
      await refetch()
      vaultsTracking.vaultMemberArchived(vault.id.toString())
    }
  }, [refetch, selectedMember, setIsModalOpen, vault?.id])

  return (
    <ModalAdvanced
      large
      title="Archive member"
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
          This member will be excluded from this vault, and any pending
          transactions requiring their approval will need to be resubmitted.
          <br />
          <br />
          Archive <strong>{selectedMember?.name}</strong>?
        </p>
      </div>
    </ModalAdvanced>
  )
}
