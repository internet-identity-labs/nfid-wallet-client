import clsx from "clsx"
import { useMemo, useState } from "react"
import { IoIosSearch } from "react-icons/io"
import { Input } from "@nfid-frontend/ui"
import { IconCmpArrow } from "@nfid-frontend/ui"

import { IGroupedSendAddress } from "./types"
import { ChooseAddressItem } from "./choose-address-item"
import { truncateString } from "@nfid-frontend/utils"
import { FT } from "frontend/integration/ft/ft"
import { getNetworkIcon } from "../../utils/network-icon"
import { useDarkTheme } from "frontend/hooks"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export interface IChooseAddressModal {
  addresses: IGroupedSendAddress[] | undefined
  title: string
  token?: FT
  isAvailableModalVisible: boolean
  onClose: () => void
  setSelectedAddress: (id: string) => void
}

export const ChooseAvailableAddressModal = ({
  addresses,
  title,
  token,
  isAvailableModalVisible,
  onClose,
  setSelectedAddress,
}: IChooseAddressModal) => {
  const isDarkTheme = useDarkTheme()
  const [searchInput, setSearchInput] = useState("")

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
    setSelectedAddress(address.id)
  }

  return (
    <div className="flex flex-col shrink-0" id={"choose_available_modal"}>
      <div
        className={clsx(
          "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
          "flex flex-col rounded-xl dark:bg-zinc-800",
          !isAvailableModalVisible && "hidden",
        )}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="cursor-pointer" onClick={onClose}>
              <IconCmpArrow className="mr-2" />
            </div>
            <p className="text-xl font-bold leading-10">{title}</p>
          </div>
        </div>
        <Input
          type="text"
          placeholder="Search by name or wallet address"
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
