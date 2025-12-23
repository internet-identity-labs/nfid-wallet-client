import ProfileTemplate from "frontend/ui/templates/profile-template/Template"
import { AddressBook } from "packages/ui/src/organisms/address-book"
import { useSWR } from "@nfid/swr"
import {
  addressBookFacade,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"

const AddressBookPage = () => {
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
