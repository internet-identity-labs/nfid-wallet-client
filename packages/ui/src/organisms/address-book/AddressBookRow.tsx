/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import { FC } from "react"
import { CopyAddress, IDropdownPosition } from "@nfid-frontend/ui"
import { UserAddress } from "frontend/integration/address-book"

import { IcpNetworkIcon } from "packages/ui/src/atoms/icons/IcpNetworkIcon"
import { BtcNetworkIcon } from "packages/ui/src/atoms/icons/BtcNetworkIcon"
import { EthNetworkIcon } from "packages/ui/src/atoms/icons/EthNetworkIcon"
import { AddressBookDropdown } from "./AddressBookDropdown"
import { FavoriteButton } from "../../molecules/favorite-button"
import { useDarkTheme } from "frontend/hooks"

interface AddressBookRowProps {
  address: UserAddress
  dropdownPosition: IDropdownPosition
  setAddressToEdit: (id: string) => void
  setAddressToRemove: (id: string) => void
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}

export const AddressBookRow: FC<AddressBookRowProps> = ({
  address,
  dropdownPosition,
  setAddressToEdit,
  setAddressToRemove,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const isDarkTheme = useDarkTheme()

  return (
    <>
      <tr
        id={`address_${address.id}`}
        className={clsx(
          "py-5 text-black border-b border-gray-100 dark:border-zinc-600 md:py-0 md:border-0 dark:text-white h-[65px]",
          "group hover:bg-gray-50 hover:dark:bg-zinc-800 transition duration-200 relative",
          "after:absolute after:bg-gray-50 dark:after:bg-zinc-800 after:w-[30px] after:h-full after:right-[-30px]",
          "before:absolute before:bg-gray-50 dark:before:bg-zinc-800 before:w-[30px] before:h-full before:left-[-30px]",
          "after:opacity-0 hover:after:opacity-100 after:transition after:duration-200",
          "before:opacity-0 hover:before:opacity-100 before:transition before:duration-200",
        )}
      >
        <td
          id={`address_${address.id}_name`}
          className={clsx(
            "flex flex-grow md:items-center",
            "py-[10px] md:py-0 md:h-16 pr-[10px] md:pr-[30px]",
            "min-w-0 w-[100%] md:w-auto mb-5 mt-2.5 md:mt-0 md:mb-0",
          )}
        >
          <div className="flex items-center min-w-0 gap-2">
            {onToggleFavorite && (
              <FavoriteButton
                id={`address_${address.id}_favorite`}
                isFavorite={isFavorite}
                itemName={address.name}
                onToggle={() => onToggleFavorite(address.id)}
              />
            )}
            <p className="font-semibold leading-5">{address.name}</p>
          </div>
        </td>
        <td
          id={`address_${address.id}_icpAccountId`}
          className="w-auto pr-[10px] min-w-[120px] dark:text-white mt-2.5 md:mt-0 md:mb-0"
        >
          {address?.icpAccountId && (
            <div className="flex items-center gap-1.5">
              <IcpNetworkIcon
                size={24}
                color={isDarkTheme ? "white" : "black"}
              />
              <CopyAddress
                className="dark:text-white"
                address={address.icpAccountId}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
          )}
        </td>
        <td
          className="pr-[10px] min-w-[120px] dark:text-white"
          id={`address_${address.id}_icpPrincipal`}
        >
          {address.icpPrincipal && (
            <div className="flex items-center gap-1.5">
              <IcpNetworkIcon
                size={24}
                color={isDarkTheme ? "white" : "black"}
              />
              <CopyAddress
                className="dark:text-white"
                address={address.icpPrincipal}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
          )}
        </td>
        <td
          id={`address_${address.id}_btc`}
          className="pr-[10px] pr-[10px] flex-grow min-w-0 w-auto min-w-[120px]"
        >
          {address.btc && (
            <div className="flex items-center gap-1.5">
              <BtcNetworkIcon
                size={24}
                color={isDarkTheme ? "white" : "black"}
              />
              <CopyAddress
                className="dark:text-white"
                address={address.btc}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
          )}
        </td>
        <td
          id={`address_${address.id}_evm`}
          className="pr-[10px] pr-[10px] flex-grow min-w-0 w-auto min-w-[120px]"
        >
          {address.evm && (
            <div className="flex items-center gap-1.5">
              <EthNetworkIcon
                size={24}
                color={isDarkTheme ? "white" : "black"}
              />
              <CopyAddress
                className="dark:text-white"
                address={address.evm}
                leadingChars={6}
                trailingChars={4}
              />
            </div>
          )}
        </td>
        <td
          className="w-[24px] min-w-[30px] min-w-[50px]"
          id={`address_${address.id}_options`}
        >
          <AddressBookDropdown
            dropdownPosition={dropdownPosition}
            setAddressToEdit={setAddressToEdit}
            setAddressToRemove={setAddressToRemove}
            address={address}
          />
        </td>
      </tr>
    </>
  )
}
