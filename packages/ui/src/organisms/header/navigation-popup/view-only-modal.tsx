import { Principal } from "@dfinity/principal"
import { FC } from "react"

import { ModalComponent } from "packages/ui/src/molecules/modal"
import { Button, Input } from "@nfid-frontend/ui"
import { useForm } from "react-hook-form"
import {
  validateBTCAddress,
  validateETHAddress,
  validatePrincipalAddress,
} from "frontend/features/transfer-modal/utils"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

interface ViewOnlyFormValues {
  address: string
}

interface ViewOnlyModalProps {
  isOpen: boolean
  onCLose: () => void
}

export const ViewOnlyModal: FC<ViewOnlyModalProps> = ({ isOpen, onCLose }) => {
  const {
    register,
    formState: { errors },
    watch,
    reset,
  } = useForm<ViewOnlyFormValues>({
    mode: "all",
    defaultValues: {
      address: "",
    },
  })

  const address = watch("address")

  const openViewOnly = () => {
    const url = new URL(
      `${ProfileConstants.base}/${ProfileConstants.tokens}`,
      window.location.origin,
    )
    url.searchParams.set("viewOnly", address)
    window.open(url.toString(), "_blank")
  }

  const closeModal = () => {
    onCLose()
    reset()
  }

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={closeModal}
      className="p-5 w-[95%] md:w-[500px] z-[100] !rounded-[24px]"
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white">
        View-only mode
      </p>
      <p className="mb-[10px] mt-[18px] text-sm leading-[22px] dark:text-white">
        Enter the Wallet Address to open the account in view-only mode.
      </p>
      <div className="relative">
        <Input
          id="view-only-address"
          labelText="Wallet address"
          placeholder="Enter address"
          {...register("address", {
            required: "Address is required",
            validate: (value) => {
              const isICP = validatePrincipalAddress(value) === true
              const isBTC = validateBTCAddress(value) === true
              const isEVM = validateETHAddress(value) === true
              return isICP || isBTC || isEVM || "Invalid wallet address"
            },
          })}
          isErrorStyles={Boolean(errors.address?.message)}
        />
        <div className="absolute left-0 top-[100%] mt-1 text-xs text-red-600 text-red-base dark:text-red-500">
          {errors.address?.message}
        </div>
      </div>
      <div className="mt-[22px] flex gap-2.5 justify-end">
        <Button
          type="stroke"
          className="w-[115px]"
          isSmall
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          className="w-[126px]"
          isSmall
          onClick={openViewOnly}
          disabled={!address || Boolean(errors["address"]?.message)}
        >
          View account
        </Button>
      </div>
    </ModalComponent>
  )
}
