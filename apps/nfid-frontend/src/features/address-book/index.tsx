import { FC } from "react"

import { useSWR } from "@nfid/swr"
import { AddressBook } from "@nfid/ui/organisms/address-book"
import ProfileTemplate from "@nfid/ui/templates/profile-template/Template"

import { NFIDTheme } from "frontend/App"
import {
  addressBookFacade,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"

type AddressBookPageProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const AddressBookPage: FC<AddressBookPageProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const create = (request: UserAddressSaveRequest) =>
    addressBookFacade.save(request)

  const update = (request: UserAddressUpdateRequest) =>
    addressBookFacade.update(request)

  const remove = (id: string) => addressBookFacade.delete(id)

  const { data: addresses, isLoading } = useSWR("addressBook", async () =>
    addressBookFacade.findAll(),
  )

  return (
    <ProfileTemplate
      showBackButton
      pageTitle="Address book"
      className="dark:text-white"
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
    >
      <AddressBook
        addresses={addresses}
        isLoading={isLoading}
        onCreate={create}
        onUpdate={update}
        onRemove={remove}
      />
    </ProfileTemplate>
  )
}

export default AddressBookPage
