import { FC, useEffect, useState } from "react"
import { ModalComponent } from "../../molecules/modal/index-v0"
import { Spinner } from "../../atoms/spinner"
import { Button, Input } from "@nfid-frontend/ui"
import { useForm } from "react-hook-form"
import {
  AddressBookAction,
  getUpdatedAddressBook,
  validateAccountId,
  validateBTCAddress,
  validateETHAddress,
  validateICRC1Address,
} from "frontend/features/transfer-modal/utils"
import {
  UserAddress,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"

import { IcpNetworkIcon } from "packages/ui/src/atoms/icons/IcpNetworkIcon"
import { BtcNetworkIcon } from "packages/ui/src/atoms/icons/BtcNetworkIcon"
import { EthNetworkIcon } from "packages/ui/src/atoms/icons/EthNetworkIcon"

type AddressBookModalProps =
  | {
      mode: AddressBookAction.CREATE
      isOpen: boolean
      onClose: () => void
      onSubmit: (request: UserAddressSaveRequest) => Promise<void>
      address?: UserAddress
      addresses?: UserAddress[]
    }
  | {
      mode: AddressBookAction.EDIT
      isOpen: boolean
      onClose: () => void
      address?: UserAddress
      onSubmit: (request: UserAddressUpdateRequest) => Promise<void>
      addresses?: UserAddress[]
    }

type AddressBookFormValues = {
  name: string
  accountId: string
  icpWallet: string
  btcWallet: string
  ethWallet: string
}

export const AddressBookModal: FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSubmit,
  address,
  addresses,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<AddressBookFormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      accountId: "",
      icpWallet: "",
      btcWallet: "",
      ethWallet: "",
    },
  })

  useEffect(() => {
    if (address) {
      reset({
        name: address.name ?? "",
        accountId: address.icpAccountId ?? "",
        icpWallet: address.icpPrincipal ?? "",
        btcWallet: address.btc ?? "",
        ethWallet: address.evm ?? "",
      })
    } else {
      reset({
        name: "",
        accountId: "",
        icpWallet: "",
        btcWallet: "",
        ethWallet: "",
      })
    }
  }, [address, reset])

  const name = watch("name")
  const accountId = watch("accountId")
  const icpWallet = watch("icpWallet")
  const btcWallet = watch("btcWallet")
  const ethWallet = watch("ethWallet")

  const submit = async () => {
    setIsLoading(true)

    if (mode === AddressBookAction.EDIT) {
      const updatePayload: UserAddressUpdateRequest = {
        id: address!.id,
        name,
        icpPrincipal: icpWallet,
        icpAccountId: accountId,
        btc: btcWallet,
        evm: ethWallet,
      }
      await getUpdatedAddressBook(
        addresses,
        updatePayload,
        AddressBookAction.EDIT,
      )
      await onSubmit(updatePayload)
    } else {
      const createPayload: UserAddressSaveRequest = {
        name,
        icpPrincipal: icpWallet,
        icpAccountId: accountId,
        btc: btcWallet,
        evm: ethWallet,
      }
      await getUpdatedAddressBook(
        addresses,
        createPayload,
        AddressBookAction.CREATE,
      )
      await onSubmit(createPayload)
    }

    setIsLoading(false)
    onClose()
  }

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={onClose}
      className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-[90vh] !h-[90vh] overflow-auto"
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5">
        Add new contact
      </p>
      <div>
        <Input
          inputClassName="!border-black dark:!border-zinc-500 h-[56px]"
          id="name"
          labelText="Name"
          className="mb-2.5"
          placeholder="Enter name"
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
          errorText={errors.name?.message}
        />
        <Input
          inputClassName="!border-black dark:!border-zinc-500 h-[56px] pl-[44px]"
          id="accountId"
          labelText="ICP Account ID"
          icon={<IcpNetworkIcon size={24} />}
          className="mb-2.5"
          placeholder="Enter account ID"
          {...register("accountId", {
            validate: (value) => !value || validateAccountId(value),
          })}
          errorText={errors.accountId?.message}
        />
        <Input
          inputClassName="!border-black dark:!border-zinc-500 h-[56px] pl-[44px]"
          id="icpWallet"
          labelText="ICP wallet address"
          icon={<IcpNetworkIcon size={24} />}
          className="mb-2.5"
          placeholder="Enter ICP wallet address"
          {...register("icpWallet", {
            validate: (value) => !value || validateICRC1Address(value),
          })}
          errorText={errors.icpWallet?.message}
        />
        <Input
          inputClassName="!border-black dark:!border-zinc-500 h-[56px] pl-[44px]"
          id="btcWallet"
          labelText="BTC wallet address"
          icon={<BtcNetworkIcon size={24} />}
          className="mb-2.5"
          placeholder="Enter BTC wallet address"
          {...register("btcWallet", {
            validate: (value) => !value || validateBTCAddress(value),
          })}
          errorText={errors.btcWallet?.message}
        />
        <Input
          inputClassName="!border-black dark:!border-zinc-500 h-[56px] pl-[44px]"
          id="ethWallet"
          labelText="ETH wallet address"
          icon={<EthNetworkIcon size={24} />}
          placeholder="Enter ETH wallet address"
          {...register("ethWallet", {
            validate: (value) => !value || validateETHAddress(value),
          })}
          errorText={errors.ethWallet?.message}
        />
      </div>
      <div className="mt-5 flex gap-2.5 h-[48px]">
        <Button
          type="stroke"
          isSmall
          className="w-full h-full"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          isSmall
          className="w-full h-full"
          onClick={handleSubmit(submit)}
          disabled={!isValid || isLoading}
          icon={isLoading ? <Spinner /> : null}
        >
          {address ? "Save" : "Add contact"}
        </Button>
      </div>
    </ModalComponent>
  )
}
