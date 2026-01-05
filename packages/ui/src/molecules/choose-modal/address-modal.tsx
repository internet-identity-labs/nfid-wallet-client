import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { useFormContext, UseFormRegisterReturn } from "react-hook-form"
import { IoIosSearch } from "react-icons/io"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow, Label } from "@nfid-frontend/ui"

import { IGroupedSendAddress } from "./types"
import { UserAddressPreview } from "frontend/integration/address-book"
import { ChooseAddressItem } from "./choose-address-item"
import { truncateString } from "@nfid-frontend/utils"
import { InputAddressTrigger } from "./triggers/address-input"
import { FT } from "frontend/integration/ft/ft"
import { getNetworkIcon } from "../../utils/network-icon"
import { useDarkTheme } from "frontend/hooks"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface IChooseAddressModal<T> {
  addresses: IGroupedSendAddress[] | undefined
  title: string
  placeholder?: string
  errorText?: string
  registerFunction?: UseFormRegisterReturn<string>
  searchAddress: (req: T) => Promise<UserAddressPreview[]>
  token?: FT
}

export const ChooseAddressModal = <T,>({
  addresses,
  title,
  placeholder,
  errorText,
  registerFunction,
  searchAddress,
  token,
}: IChooseAddressModal<T>) => {
  const isDarkTheme = useDarkTheme()
  const [searchInput, setSearchInput] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [value, setValue] = useState<string | undefined>()
  const [preview, setPreview] = useState<UserAddressPreview[]>()
  const { setValue: setFormValue, resetField, watch } = useFormContext()
  const toValue = watch("to")

  useEffect(() => {
    resetField("to")
    setValue(undefined)
  }, [token])

  const selectedAddress = useMemo(() => {
    if (!value || !addresses) return

    return addresses?.find((a) => a.id === value)
  }, [value, addresses])

  const filteredAddresses = useMemo(() => {
    if (!addresses) return
    if (!searchInput || searchInput.length < 2) return addresses

    const searchQuery = searchInput.toLowerCase()
    return addresses.filter(
      ({ title, value }) =>
        title.toLowerCase().includes(searchQuery) ||
        value?.toLowerCase().includes(searchQuery),
    )
  }, [addresses, searchInput])

  const handleSelect = (address: IGroupedSendAddress) => {
    setValue(address.id)
    if (address.value) {
      setFormValue("to", address.value, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    setIsModalVisible(false)
  }

  useEffect(() => {
    if (selectedAddress || !value || value.length < 2) {
      setPreview(undefined)
      return
    }

    if (token) {
      searchAddress({
        chainId: token.getChainId(),
        category: token.getTokenCategory(),
        nameOrAddressLike: value,
      } as T).then(setPreview)

      return
    }

    searchAddress({
      nameOrAddressLike: value,
    } as T).then(setPreview)
  }, [selectedAddress, token, value, searchAddress])

  return (
    <div className="flex flex-col shrink-0" id={"choose_modal"}>
      <Label className="flex mb-1 dark:text-white">
        To
        {selectedAddress && (
          <div className="relative pl-3">
            <div
              className={clsx(
                "absolute w-0.5 h-0.5 left-[5px] my-auto bottom-0 top-0",
                "bg-black dark:bg-white rounded-full",
              )}
            ></div>
            <span>{selectedAddress.title}</span>
          </div>
        )}
      </Label>
      <div className="relative mb-[18px]">
        <InputAddressTrigger
          placeholder={placeholder}
          onShowModal={
            addresses && addresses.length > 0
              ? () => setIsModalVisible(true)
              : undefined
          }
          value={toValue}
          errorText={errorText}
          registerFunction={registerFunction}
          setValue={setValue}
        />
        {preview && preview.length > 0 && (
          <div
            className={clsx(
              "absolute z-[2] w-full top-[100%] left-0 bg-white dark:bg-zinc-800",
              "rounded-[12px] shadow-[0px_2px_10px_rgba(0,0,0,0.15)]",
              "max-h-[120px] overflow-auto snap-end pr-[10px]",
              "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
              "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
              "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800",
            )}
          >
            {preview.map((p) => (
              <div
                className="flex items-center gap-2 h-[60px] px-2.5 cursor-pointer"
                key={p.id}
                onClick={() => {
                  setValue(p.id)
                  setFormValue("to", p.address.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
              >
                <div>
                  {getNetworkIcon(
                    token?.getChainId() || ChainId.ICP,
                    isDarkTheme,
                    32,
                  )}
                </div>
                <div>
                  <p className="font-semibold leading-5 text-black dark:text-white">
                    {p.name}
                  </p>
                  <p className="text-xs leading-5 text-secondary dark:text-zinc-500 ">
                    {truncateString(p.address.value ?? "", 6, 4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
          "flex flex-col rounded-xl dark:bg-zinc-800",
          !isModalVisible && "hidden",
        )}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalVisible(false)}
            >
              <IconCmpArrow className="mr-2" />
            </div>
            <p className="text-xl font-bold leading-10">{title}</p>
          </div>
        </div>
        <Input
          type="text"
          placeholder="Search by name or wallet address "
          inputClassName="!border-black dark:!border-zinc-500"
          icon={<IoIosSearch size="20" className="text-gray-400" />}
          onKeyUp={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          className="mt-4 mb-5"
        />
        <div
          className={clsx(
            "flex-1 overflow-auto snap-end pr-[10px]",
            "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
            "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
            "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800",
          )}
        >
          {filteredAddresses &&
            filteredAddresses.map((address) => (
              <ChooseAddressItem
                key={address.id}
                handleClick={() => handleSelect(address)}
                image={
                  token
                    ? getNetworkIcon(token.getChainId(), isDarkTheme, 32)
                    : getNetworkIcon(ChainId.ICP, isDarkTheme, 32)
                }
                title={address.title}
                subTitle={
                  address.subTitle && truncateString(address.subTitle, 6, 4)
                }
                id={`address_${address.id.replace(/\s/g, "")}`}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
