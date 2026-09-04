import clsx from "clsx"
import React from "react"

import { Button, H5 } from "@nfid-frontend/ui"
import AddressBookImage from "../assets/address-book.png"
import AddressBookDarkImage from "../assets/address-book-dark.png"
import { useDarkTheme } from "frontend/hooks"

export interface SendAddressBookProps {
  onClose?: () => void
  isOpen: boolean
  hasContactsToUpdate?: boolean
  setCreateContactModalOpen: (value: boolean) => void
  setUpdateContactModalOpen: (value: boolean) => void
}

export const SendAddressBook: React.FC<SendAddressBookProps> = ({
  onClose,
  isOpen,
  hasContactsToUpdate,
  setCreateContactModalOpen,
  setUpdateContactModalOpen,
}) => {
  const isDarkTheme = useDarkTheme()
  return (
    <div
      id={"address_book_window"}
      className={clsx(
        "text-black dark:text-white text-center w-full h-full",
        "px-5 pb-5 pt-[18px] absolute left-0 top-0 z-[3]",
        "bg-white dark:bg-darkGray",
        !isOpen && "hidden",
      )}
    >
      <div className="text-left">
        <H5 className="text-xl !font-bold leading-10 pb-2 dark:text-white">
          Add to address book?
        </H5>
        <p className="mt-2.5 text-sm leading-5">
          You just sent funds to this address. Add it to your Address Book to
          make your next transfer much faster.
        </p>
        <img
          className="block my-5"
          src={isDarkTheme ? AddressBookDarkImage : AddressBookImage}
          alt="NFID address book"
        />
      </div>
      <div className="flex flex-col gap-2 mb-[30px]">
        <Button
          type="primary"
          block
          onClick={() => setCreateContactModalOpen(true)}
        >
          Add new contact
        </Button>
        {hasContactsToUpdate && (
          <Button
            type="stroke"
            block
            onClick={() => setUpdateContactModalOpen(true)}
          >
            Add to existing contact
          </Button>
        )}
        <Button type="ghost" block onClick={onClose}>
          Not now
        </Button>
      </div>
    </div>
  )
}
