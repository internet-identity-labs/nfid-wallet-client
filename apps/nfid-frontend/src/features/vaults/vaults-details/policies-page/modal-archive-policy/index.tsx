import clsx from "clsx"
import React, { Dispatch, SetStateAction, useCallback, useState } from "react"
import { toast } from "react-toastify"

import { IconCmpArchive, ModalAdvanced } from "@nfid-frontend/ui"
import { ObjectState, Policy, updatePolicy } from "@nfid/integration"

import { useVaultPolicies } from "frontend/features/vaults/hooks/use-vault-policies"

interface VaultArchivePolicyProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedPolicy?: Policy
}

export const VaultArchivePolicy: React.FC<VaultArchivePolicyProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedPolicy,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { refetch } = useVaultPolicies()

  const onArchivePolicy = useCallback(async () => {
    if (!selectedPolicy) return

    try {
      setIsLoading(true)
      await updatePolicy({
        ...selectedPolicy,
        state: ObjectState.ARCHIVED,
      })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success("Policy archived")
      await refetch()
    }
  }, [refetch, selectedPolicy, setIsModalOpen])

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
        onClick: onArchivePolicy,
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
          Archive policy?
        </p>
      </div>
    </ModalAdvanced>
  )
}
