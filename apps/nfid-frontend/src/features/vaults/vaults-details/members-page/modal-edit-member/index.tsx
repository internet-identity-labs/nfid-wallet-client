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

import { Input, ModalAdvanced } from "@nfid-frontend/ui"
import { storeMember, VaultMember, vaultsTracking } from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"

interface VaultMemberEditProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedMember?: VaultMember
}

interface VaultMemberEditForm {
  name?: string
  userId?: string
}

export const VaultEditMember: React.FC<VaultMemberEditProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedMember,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { vault, refetch } = useVault()

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: useMemo(() => {
      return {
        name: selectedMember?.name,
        userId: selectedMember?.userId,
      }
    }, [selectedMember?.name, selectedMember?.userId]),
  })

  useEffect(() => {
    reset(selectedMember)
  }, [reset, selectedMember])

  const onMemberEdit = useCallback(
    async (data: VaultMemberEditForm) => {
      if (!selectedMember || !vault?.id) return

      try {
        setIsLoading(true)
        await storeMember({
          ...selectedMember,
          vaultId: BigInt(vault.id),
          memberAddress: selectedMember.userId,
          name: data.name ?? "",
        })
      } catch (e: any) {
        toast.error(e.message)
      } finally {
        setIsLoading(false)
        setIsModalOpen(false)
        toast.success("Vault member updated")
        vaultsTracking.vaultMemberUpdated(vault.id.toString())
        await refetch()
      }
    },
    [refetch, selectedMember, setIsModalOpen, vault?.id],
  )

  return (
    <ModalAdvanced
      large
      title={"Edit member"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onMemberEdit),
        text: "Save",
      }}
    >
      <Input
        labelText="Name"
        errorText={formState.errors.name?.message}
        {...register("name", {
          required: "First name must not be blank",
        })}
      />
      <Input disabled labelText="NFID address" {...register("userId")} />
    </ModalAdvanced>
  )
}
