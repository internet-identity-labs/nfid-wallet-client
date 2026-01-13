import { FC } from "react"

import {
  Dropdown,
  DropdownOption,
  IconCmpDots,
  IconSvgPencil,
  IconSvgPencilWhite,
  IconSvgTrash,
  IconSvgTrashWhite,
  IDropdownPosition,
} from "@nfid/ui"

import { useDarkTheme } from "frontend/hooks"
import { UserAddress } from "frontend/integration/address-book"

type AddressBookDropdownProps = {
  address: UserAddress
  dropdownPosition: IDropdownPosition
  setAddressToEdit: (id: string) => void
  setAddressToRemove: (id: string) => void
}

export const AddressBookDropdown: FC<AddressBookDropdownProps> = ({
  address,
  dropdownPosition,
  setAddressToEdit,
  setAddressToRemove,
}) => {
  const isDarkTheme = useDarkTheme()

  return (
    <>
      <Dropdown
        position={dropdownPosition}
        className={"!rounded-[12px]"}
        triggerElement={
          <IconCmpDots className="mx-auto transition-all cursor-pointer text-secondary hover:text-black dark:text-zinc-400 dark:hover:text-white" />
        }
      >
        <DropdownOption
          label="Edit"
          icon={isDarkTheme ? IconSvgPencilWhite : IconSvgPencil}
          handler={() => setAddressToEdit(address.id)}
        />
        <DropdownOption
          label="Remove"
          icon={isDarkTheme ? IconSvgTrashWhite : IconSvgTrash}
          handler={() => setAddressToRemove(address.id)}
        />
      </Dropdown>
    </>
  )
}
