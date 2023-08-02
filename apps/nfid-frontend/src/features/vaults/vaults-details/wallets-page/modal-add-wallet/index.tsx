import clsx from "clsx"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { IconCmpPlus, Input, ModalAdvanced } from "@nfid-frontend/ui"
import { registerWallet, vaultsTracking } from "@nfid/integration"

import { useVaultWallets } from "frontend/features/vaults/hooks/use-vault-wallets"

interface WalletCreateForm {
  name: string
}

export const VaultAddWallet = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { vaultId, refetch } = useVaultWallets()

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
    },
  })

  React.useEffect(() => {
    if (isModalOpen) {
      vaultsTracking.addVaultAccountModalOpened()
    }
  }, [isModalOpen])

  const onAddMember = async ({ name }: WalletCreateForm) => {
    if (!vaultId) return

    try {
      setIsLoading(true)
      await registerWallet({ name: name, vaultId: BigInt(vaultId) })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success(`Wallet ${name} successfully added`)
      await refetch()
    }
  }

  return (
    <ModalAdvanced
      large
      title={"Add wallet"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onAddMember),
        text: "Create",
        id: "create-wallet-button",
      }}
      trigger={
        <div
          className={clsx(
            "flex items-center space-x-2 font-bold text-blue-600 cursor-pointer",
            "hover:opacity-50 transition-opacity",
          )}
          id="create-wallet-trigger"
        >
          <IconCmpPlus className="w-4" />
          <span className="hidden text-sm sm:block">Add wallet</span>
        </div>
      }
    >
      <div className="space-y-5">
        <Input
          labelText="Name"
          errorText={formState.errors.name?.message}
          {...register("name", {
            required: "This field cannot be empty",
          })}
        />
      </div>
    </ModalAdvanced>
  )
}
