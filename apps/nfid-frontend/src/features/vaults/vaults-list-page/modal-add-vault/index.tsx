import clsx from "clsx"
import { useState } from "react"
import { useForm } from "react-hook-form"

import {
  IconCmpPlus,
  Input,
  ModalAdvanced,
  TextArea,
  vaultRules,
} from "@nfid-frontend/ui"
import { registerVault } from "@nfid/integration"

interface VaultCreateForm {
  vaultName: string
  description: string
}

interface IVaultModalCreate {
  refetchVaults: () => void
}

export const VaultModalCreate = ({ refetchVaults }: IVaultModalCreate) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      vaultName: "",
      description: "",
    },
  })

  const onVaultCreate = async ({ description, vaultName }: VaultCreateForm) => {
    setIsLoading(true)
    await registerVault(vaultName, description)
    setIsLoading(false)
    refetchVaults()
    setIsModalOpen(false)
  }

  return (
    <ModalAdvanced
      large
      title={"Add vault"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onVaultCreate),
        text: "Create",
        id: "create-vault-button",
      }}
      trigger={
        <div
          className={clsx(
            "flex items-center space-x-2 font-bold text-blue-600 cursor-pointer",
            "hover:opacity-50 transition-opacity",
          )}
          id="create-vault-trigger"
        >
          <IconCmpPlus className="w-4" />
          <span className="hidden text-sm sm:block">Add vault</span>
        </div>
      }
    >
      <Input
        placeholder="Vault name"
        labelText="Enter vault name"
        errorText={formState.errors.vaultName?.message}
        {...register("vaultName", {
          required: vaultRules.errorMessages.required,
          minLength: {
            value: vaultRules.minLength,
            message: vaultRules.errorMessages.length,
          },
        })}
      />
      <TextArea
        className="mt-3"
        labelText="Description (optional)"
        placeholder="Differentiate the purpose of this vault from your others with an optional description about its function."
        rows={4}
        {...register("description")}
      />
    </ModalAdvanced>
  )
}
