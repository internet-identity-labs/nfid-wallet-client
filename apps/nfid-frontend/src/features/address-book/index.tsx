import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { AddressBook } from "packages/ui/src/organisms/address-book"
import { useSWR } from "@nfid/swr"
import {
  addressBookFacade,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"
import { FC } from "react"
import { NFIDTheme } from "frontend/App"

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
