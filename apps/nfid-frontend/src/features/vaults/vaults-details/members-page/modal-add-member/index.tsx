import clsx from "clsx"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { IconCmpPlus, Input, ModalAdvanced } from "@nfid-frontend/ui"
import { ObjectState, storeMember, VaultRole } from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"

interface VaultCreateForm {
  name: string
  address: string
}

export const VaultAddMember = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { vault, refetch } = useVault()

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
      address: "",
    },
  })

  const onAddMember = async ({ name, address }: VaultCreateForm) => {
    if (!vault?.id) return

    try {
      setIsLoading(true)
      await storeMember({
        memberAddress: address,
        name: name,
        vaultId: vault?.id,
        role: VaultRole.MEMBER,
        state: ObjectState.ACTIVE,
      })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success(`Member ${name} successfully added`)
      await refetch()
    }
  }

  return (
    <ModalAdvanced
      large
      title={"Add member"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onAddMember),
        text: "Add",
      }}
      trigger={
        <div
          className={clsx(
            "flex items-center space-x-2 font-bold text-blue-600 cursor-pointer",
            "hover:opacity-50 transition-opacity",
          )}
        >
          <IconCmpPlus className="w-4" />
          <span className="hidden text-sm sm:block">Add member</span>
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
        <Input
          labelText="NFID address"
          errorText={formState.errors.address?.message}
          {...register("address", {
            required: "This field cannot be empty",
          })}
        />
      </div>
    </ModalAdvanced>
  )
}
