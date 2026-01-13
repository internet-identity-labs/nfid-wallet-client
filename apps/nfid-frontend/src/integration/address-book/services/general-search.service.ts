import { UserAddressEntity } from "../interfaces"
import { AddressBookMapper } from "../mapper/address-book.mapper"
import { SearchRequest, UserAddressPreview } from "../types"

export class GeneralSearchService {
  constructor(private readonly mapper: AddressBookMapper) {}

  search(
    entities: UserAddressEntity[],
    request: SearchRequest,
  ): UserAddressPreview | undefined {
    const found = entities
      .flatMap((entity) =>
        entity.addresses.map((address) => ({ entity, address })),
      )
      .find(({ address }) => address.value === request.address)

    return found && this.mapper.toPreview(found.entity, found.address)
  }
}
