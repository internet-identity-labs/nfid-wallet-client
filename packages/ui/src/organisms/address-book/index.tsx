import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { FC, useMemo, useState } from "react"

import { useDarkTheme } from "frontend/hooks"
import clsx from "clsx"
import { IoIosSearch } from "react-icons/io"

import { AddressBookEmptyIcon } from "../../atoms/icons/AddressBookEmpty"
import { IconCmpPlus } from "../../atoms/icons"

import { Button, Input, TableTokenSkeleton } from "@nfid-frontend/ui"

import {
  UserAddress,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { AddressBookRow } from "./AddressBookRow"
import { AddressBookModal } from "./AddressBookModal"
import { ModalComponent } from "@nfid-frontend/ui"
import { Spinner } from "../../atoms/spinner"
import {
  AddressBookAction,
  getUpdatedAddressBook,
} from "frontend/features/transfer-modal/utils"

import SortAscendingIcon from "../tokens/assets/sort-ascending.svg"
import SortDefaultIcon from "../tokens/assets/sort-default.svg"
import SortDescendingIcon from "../tokens/assets/sort-descending.svg"
import SortHoverIcon from "../tokens/assets/sort-hover.svg"

enum AddressBookSorting {
  ASCENDING = "ASCENDING",
  DESCENDING = "DESCENDING",
  DEFAULT = "DEFAULT",
}

interface AddressBookProps {
  addresses: UserAddress[] | undefined
  isLoading: boolean
  onCreate: (request: UserAddressSaveRequest) => Promise<void>
  onUpdate: (request: UserAddressUpdateRequest) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export const AddressBook: FC<AddressBookProps> = ({
  addresses,
  isLoading,
  onCreate,
  onUpdate,
  onRemove,
}) => {
  const isDarkTheme = useDarkTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState<string | null>(null)
  const [addressToRemove, setAddressToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [sorting, setSorting] = useState<AddressBookSorting>(
    AddressBookSorting.DEFAULT,
  )
  const [searchQuery, setSearchQuery] = useState("")

  const submit = async () => {
    if (!addressToRemove) return
    setIsRemoving(true)

    await onRemove(addressToRemove)
    await getUpdatedAddressBook(
      addresses,
      { id: addressToRemove },
      AddressBookAction.REMOVE,
    )

    setIsRemoving(false)
    setAddressToRemove(null)
  }

  const handleSorting = () => {
    setSorting((prev) => {
      switch (prev) {
        case AddressBookSorting.DEFAULT:
          return AddressBookSorting.DESCENDING
        case AddressBookSorting.DESCENDING:
          return AddressBookSorting.ASCENDING
        case AddressBookSorting.ASCENDING:
          return AddressBookSorting.DEFAULT
        default:
          return AddressBookSorting.DEFAULT
      }
    })
  }

  const sortedAddresses = useMemo(() => {
    if (!addresses) return []

    if (sorting === AddressBookSorting.DEFAULT) {
      return addresses
    }

    return [...addresses].sort((a, b) => {
      const nameA = a.name?.toLowerCase() ?? ""
      const nameB = b.name?.toLowerCase() ?? ""

      if (sorting === AddressBookSorting.ASCENDING) {
        return nameA.localeCompare(nameB)
      }

      if (sorting === AddressBookSorting.DESCENDING) {
        return nameB.localeCompare(nameA)
      }

      return 0
    })
  }, [addresses, sorting])

  const getSortingIcon = () => {
    const isActive =
      sorting === AddressBookSorting.ASCENDING ||
      sorting === AddressBookSorting.DESCENDING

    if (!isActive) {
      return isHovered || isDarkTheme ? SortHoverIcon : SortDefaultIcon
    }

    return sorting === AddressBookSorting.ASCENDING
      ? SortAscendingIcon
      : SortDescendingIcon
  }

  const filteredAddresses = useMemo(() => {
    if (!sortedAddresses) return []

    if (!searchQuery) return sortedAddresses

    const query = searchQuery.toLowerCase()
    return sortedAddresses.filter((address) => {
      return (
        address.name?.toLowerCase().includes(query) ||
        address.icpAccountId?.toLowerCase().includes(query) ||
        address.icpPrincipal?.toLowerCase().includes(query) ||
        address.btc?.toLowerCase().includes(query) ||
        address.evm?.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, sortedAddresses])

  return (
    <>
      <ProfileContainer
        className="my-[20px] sm:my-[30px] sm:p-[20px] sm:p-[30px] dark:text-white"
        innerClassName="!px-0"
        titleClassName="!px-0"
      >
        {isLoading || !addresses ? (
          <table className="w-full">
            <TableTokenSkeleton
              tableRowsAmount={5}
              tableCellAmount={getIsMobileDeviceMatch() ? 2 : 5}
            />
          </table>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 my-[50px]">
            <AddressBookEmptyIcon
              strokeColor={isDarkTheme ? "#71717A" : "#9CA3AF"}
            />
            <div className="text-secondary dark:text-zinc-500">
              Your address book is currently empty.
            </div>
            <Button
              id="addAddress"
              className="mt-5 w-[144px]"
              innerClassName="!space-x-1 !h-[40px] !md:h-full"
              icon={<IconCmpPlus className="w-[18px] h-[18px] text-white" />}
              onClick={() => setIsModalOpen(true)}
              isSmall
            >
              Add contact
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row gap-5 mb-[30px]">
              <Input
                inputClassName="!border-black dark:!border-zinc-500 w-full"
                icon={
                  <IoIosSearch
                    size="20"
                    className="text-gray-400 dark:text-zinc-500"
                  />
                }
                className="flex-1"
                placeholder="Search by name or wallet address"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                id="addAddress"
                className="w-[144px]"
                innerClassName="!space-x-1 !h-[40px] !md:h-full"
                icon={<IconCmpPlus className="w-[18px] h-[18px] text-white" />}
                onClick={() => setIsModalOpen(true)}
                isSmall
              >
                Add contact
              </Button>
            </div>
            <div className="overflow-scroll md:overflow-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="text-secondary dark:text-zinc-500 h-[40px]">
                  <tr className="text-sm font-bold leading-5">
                    <th
                      className="w-[25%] min-w-[100px] pr-[30px] cursor-pointer hover:text-gray-500"
                      onClick={handleSorting}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <span className="flex whitespace-nowrap items-center gap-[6px]">
                        Name{" "}
                        <img
                          className="w-[18px] h-[18px] ms-[5px]"
                          src={getSortingIcon()}
                          alt="Sorting"
                        />
                      </span>
                    </th>
                    <th className="w-[20%] pr-[10px] min-w-[100px]">
                      ICP account ID
                    </th>
                    <th className={clsx("w-[20%] pr-[10px] min-w-[100px]", "")}>
                      ICP wallet address
                    </th>
                    <th className="w-[20%] pr-[10px] min-w-[100px]">
                      BTC wallet address
                    </th>
                    <th className="w-[20%] pr-[10px] min-w-[100px]">
                      ETH wallet address
                    </th>
                    <th className="w-[30px] lg:w-[50px]"></th>
                  </tr>
                </thead>
                {filteredAddresses.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center h-[100px] text-secondary dark:text-zinc-500"
                      >
                        <p className="text-secondary dark:text-zinc-500 mt-[30px]">
                          No contacts found.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="h-16 text-sm text-black">
                    {filteredAddresses.map((address, index, arr) => (
                      <AddressBookRow
                        key={`${address.id}`}
                        address={address}
                        dropdownPosition={
                          index + 3 > arr.length ? "top" : "bottom"
                        }
                        setAddressToEdit={setAddressToEdit}
                        setAddressToRemove={setAddressToRemove}
                      />
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}
        <AddressBookModal
          mode={AddressBookAction.CREATE}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onCreate}
          addresses={addresses}
        />
        <AddressBookModal
          mode={AddressBookAction.EDIT}
          isOpen={Boolean(addressToEdit)}
          onClose={() => setAddressToEdit(null)}
          address={addresses?.find((a) => a.id === addressToEdit)}
          onSubmit={onUpdate}
          addresses={addresses}
        />
        <ModalComponent
          isVisible={Boolean(addressToRemove)}
          onClose={() => setAddressToRemove(null)}
          className="p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px]"
        >
          <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5">
            Remove contact
          </p>
          <p className="py-[22.5px]">
            Are you sure you want to remove{" "}
            <strong>
              {addresses?.find((a) => a.id === addressToRemove)?.name}
            </strong>
            ?
          </p>
          <div className="mt-5 flex justify-end gap-2.5 h-[40px]">
            <Button
              type="stroke"
              isSmall
              className="w-[100px] h-full"
              onClick={() => setAddressToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              type="red"
              isSmall
              className="w-[100px] h-full"
              onClick={submit}
              disabled={isRemoving}
              icon={isRemoving ? <Spinner /> : null}
            >
              Remove
            </Button>
          </div>
        </ModalComponent>
      </ProfileContainer>
    </>
  )
}
