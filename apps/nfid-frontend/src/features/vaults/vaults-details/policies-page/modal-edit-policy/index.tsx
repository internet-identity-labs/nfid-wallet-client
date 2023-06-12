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
import { minMax } from "@nfid-frontend/utils"
import { Policy, updatePolicy } from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { useVaultPolicies } from "frontend/features/vaults/hooks/use-vault-policies"
import {
  e8sICPToString,
  stringICPtoE8s,
} from "frontend/integration/wallet/utils"

interface VaultPolicyEditProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  selectedPolicy?: Policy
}

interface VaultPolicyEditForm {
  amount: number
  approvers: number
  wallet: string
}

export const VaultEditPolicy: React.FC<VaultPolicyEditProps> = ({
  isModalOpen,
  setIsModalOpen,
  selectedPolicy,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { refetch } = useVaultPolicies()
  const { vault } = useVault()

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: useMemo(() => {
      return {
        amount: Number(e8sICPToString(Number(selectedPolicy?.amountThreshold))),
        approvers: Number(selectedPolicy?.memberThreshold),
        wallet: String(
          selectedPolicy?.wallets ? selectedPolicy.wallets[0] : "Any",
        ),
      }
    }, [
      selectedPolicy?.amountThreshold,
      selectedPolicy?.memberThreshold,
      selectedPolicy?.wallets,
    ]),
  })

  useEffect(() => {
    reset({
      amount: Number(e8sICPToString(Number(selectedPolicy?.amountThreshold))),
      approvers: Number(selectedPolicy?.memberThreshold),
      wallet: String(
        selectedPolicy?.wallets ? selectedPolicy.wallets[0] : "Any",
      ),
    })
  }, [reset, selectedPolicy])

  const onPolicyEdit = useCallback(
    async (data: VaultPolicyEditForm) => {
      if (!selectedPolicy) return

      try {
        setIsLoading(true)
        await updatePolicy({
          ...selectedPolicy,
          amountThreshold: BigInt(stringICPtoE8s(String(data.amount))),
          memberThreshold: Number(data.approvers),
        })
      } catch (e: any) {
        toast.error(e.message)
      } finally {
        setIsLoading(false)
        setIsModalOpen(false)
        toast.success("Vault policy updated")
        await refetch()
      }
    },
    [refetch, selectedPolicy, setIsModalOpen],
  )

  return (
    <ModalAdvanced
      large
      title={"Edit policy"}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      isModalOpenChange={setIsModalOpen}
      secondaryButton={{ type: "stroke", onClick: () => {}, text: "Cancel" }}
      primaryButton={{
        type: "primary",
        onClick: handleSubmit(onPolicyEdit),
        text: "Save",
      }}
    >
      <div className="space-y-5">
        <Input
          disabled
          labelText="Transactions sourced from this wallet"
          {...register("wallet")}
        />
        <Input
          labelText="That are greater than"
          type="number"
          innerText="ICP"
          errorText={formState.errors.amount?.message}
          {...register("amount", {
            required: "This field cannot be empty",
          })}
        />
        <Input
          labelText="Will require this number of approvers"
          type="number"
          innerText={`of ${vault?.members.length}`}
          errorText={formState.errors.approvers?.message}
          {...register("approvers", {
            required: "This field cannot be empty",
            validate: minMax({
              min: 1,
              max: 255,
              toLowError: "Minimum amount is 1",
              toBigError: "Maximum amount is 255",
            }),
          })}
        />
      </div>
    </ModalAdvanced>
  )
}
