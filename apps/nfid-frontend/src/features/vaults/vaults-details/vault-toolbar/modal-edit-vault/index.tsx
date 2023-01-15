import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Input, ModalAdvanced, TextArea, vaultRules } from "@nfid-frontend/ui"
import { Vault } from "@nfid/integration"

interface VaultMemberEditProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedVault?: Vault
}

interface VaultEditForm {
  name: string
  description?: string
}

export const VaultEditModal: React.FC<VaultMemberEditProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedVault,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: useMemo(() => {
      return {
        name: "",
        description: "",
      }
    }, []),
  })

  useEffect(() => {
    reset(selectedVault)
  }, [reset, selectedVault])

  const onVaultEdit = useCallback(
    async (data: VaultEditForm) => {
      if (!selectedVault) return

      try {
        setIsLoading(true)
        // TODO: I've not found function for that on integration layer
        // await storeVault({
        //   ...selectedVault,
        //   name: data.name,
        //   description: data.description
        // })
      } catch (e: any) {
        toast.error(e.message)
      } finally {
        setIsLoading(false)
        setIsModalOpen(false)
        toast.success("Vault updated")
      }
    },
    [selectedVault, setIsModalOpen],
  )

  return (
    <ModalAdvanced
      large
      title={"Edit vault"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onVaultEdit),
        text: "Save",
      }}
    >
      <Input
        placeholder="Vault name"
        labelText="Enter vault name"
        errorText={formState.errors.name?.message}
        {...register("name", {
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
