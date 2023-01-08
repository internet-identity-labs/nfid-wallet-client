import clsx from "clsx"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import {
  DropdownSelect,
  IconCmpPlus,
  Input,
  IOption,
  ModalAdvanced,
} from "@nfid-frontend/ui"
import {
  Currency,
  ObjectState,
  PolicyType,
  registerPolicy,
} from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { useVaultPolicies } from "frontend/features/vaults/hooks/use-vault-policies"
import { useVaultWallets } from "frontend/features/vaults/hooks/use-vault-wallets"

interface PolicyCreateForm {
  amount: number
  approvers: number
}

export const VaultAddPolicy = () => {
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { refetch } = useVaultPolicies()
  const { wallets } = useVaultWallets()
  const { vault } = useVault()

  const walletsOptions: IOption[] | undefined = useMemo(() => {
    return wallets?.map((wallet) => ({
      label: wallet.name ?? "",
      value: wallet.uid ?? "",
      disabled: wallet.state === ObjectState.ARCHIVED,
    }))
  }, [wallets])

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      amount: 0,
      approvers: 0,
    },
  })

  const onAddPolicy = async ({ amount, approvers }: PolicyCreateForm) => {
    if (!vault?.id) return

    try {
      setIsLoading(true)
      await registerPolicy({
        vaultId: vault?.id,
        amountThreshold: BigInt(amount),
        currency: Currency.ICP,
        memberThreshold: Number(approvers),
        type: PolicyType.THRESHOLD_POLICY,
        wallets: selectedWallets.length > 1 ? undefined : selectedWallets,
      })
    } catch (e: any) {
      console.log({ e })
      toast.error(e.message)
    } finally {
      setIsLoading(false)
      setIsModalOpen(false)
      toast.success(`Policy successfully added`)
      await refetch()
    }
  }

  return (
    <ModalAdvanced
      large
      title={"Add policy"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onAddPolicy),
        text: "Add",
        id: "create-policy-button",
      }}
      trigger={
        <div
          className={clsx(
            "flex items-center space-x-2 font-bold text-blue-600 cursor-pointer",
            "hover:opacity-50 transition-opacity",
          )}
          id="create-policy-trigger"
        >
          <IconCmpPlus className="w-4" />
          <span className="hidden text-sm sm:block">Add policy</span>
        </div>
      }
    >
      <div className="space-y-5" id="create-policy-modal">
        <DropdownSelect
          label="Source (transactions sourced from this wallet)"
          options={walletsOptions ?? []}
          selectedValues={selectedWallets}
          setSelectedValues={setSelectedWallets}
          isMultiselect={false}
          showSelectAllOption
          placeholder="Select wallet"
          id="select-wallet"
        />
        <div className="grid grid-cols-2 gap-5">
          <Input
            labelText="Greater than (that are greater than)"
            type="number"
            innerText="ICP"
            errorText={formState.errors.amount?.message}
            {...register("amount", {
              required: "This field cannot be empty",
            })}
          />
          <Input
            labelText="Approvers"
            type="number"
            innerText={`of ${vault?.members.length}`}
            errorText={formState.errors.approvers?.message}
            {...register("approvers", {
              required: "This field cannot be empty",
            })}
          />
        </div>
      </div>
    </ModalAdvanced>
  )
}
