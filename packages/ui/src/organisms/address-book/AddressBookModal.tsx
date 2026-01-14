import { FC, useEffect, useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "@nfid-frontend/ui"
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
import {
  AddressBookFormValues,
  chainValidate,
  validateAddressBook,
} from "./utils"
import { useDarkTheme } from "frontend/hooks"

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

export const AddressBookModal: FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSubmit,
  address,
  addresses,
}) => {
  const isDarkTheme = useDarkTheme()
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
      className={clsx(
        "p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-1 overflow-auto",
        "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 snap-end",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-darkGray",
      )}
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5">
        {mode === AddressBookAction.CREATE ? "Add new contact" : "Edit contact"}
      </p>
      <div>
        <Input
          inputClassName="h-[60px]"
          id="name"
          labelText="Name"
          placeholder="Enter name"
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
            validate: validateAddressBook(
              addresses,
              "name",
              "This name already exists",
              (v) => v.trim().toLowerCase(),
              address?.id,
            ),
          })}
          errorText={errors.name?.message}
        />
        <Input
          inputClassName="h-[60px]"
          id="accountId"
          labelText="ICP Account ID"
          icon={
            <IcpNetworkIcon size={24} color={isDarkTheme ? "white" : "black"} />
          }
          {...register("accountId", {
            validate: chainValidate(
              (v) => !v || validateAccountId(v),
              validateAddressBook(
                addresses,
                "icpAccountId",
                "This Account ID already exists",
                (v) => v.trim(),
                address?.id,
              ),
            ),
          })}
          errorText={errors.accountId?.message}
        />
        <Input
          inputClassName="h-[60px]"
          id="icpWallet"
          labelText="ICP wallet address"
          icon={
            <IcpNetworkIcon size={24} color={isDarkTheme ? "white" : "black"} />
          }
          {...register("icpWallet", {
            validate: chainValidate(
              (v) => !v || validateICRC1Address(v),
              validateAddressBook(
                addresses,
                "icpPrincipal",
                "This ICP wallet already exists",
                (v) => v.trim(),
                address?.id,
              ),
            ),
          })}
          errorText={errors.icpWallet?.message}
        />
        <Input
          inputClassName="h-[60px]"
          id="btcWallet"
          labelText="BTC wallet address"
          icon={
            <BtcNetworkIcon size={24} color={isDarkTheme ? "white" : "black"} />
          }
          {...register("btcWallet", {
            validate: chainValidate(
              (v) => !v || validateBTCAddress(v),
              validateAddressBook(
                addresses,
                "btc",
                "This BTC wallet already exists",
                (v) => v.trim(),
                address?.id,
              ),
            ),
          })}
          errorText={errors.btcWallet?.message}
        />
        <Input
          inputClassName="h-[60px]"
          id="ethWallet"
          labelText="ETH wallet address"
          icon={
            <EthNetworkIcon size={24} color={isDarkTheme ? "white" : "black"} />
          }
          {...register("ethWallet", {
            validate: chainValidate(
              (v) => !v || validateETHAddress(v),
              validateAddressBook(
                addresses,
                "evm",
                "This ETH wallet already exists",
                (v) => v.toLowerCase(),
                address?.id,
              ),
            ),
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
