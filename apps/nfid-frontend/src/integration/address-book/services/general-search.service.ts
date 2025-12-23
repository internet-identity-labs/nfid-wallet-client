import { AddressBookMapper } from "../mapper/address-book.mapper"
import { SearchRequest, UserAddressPreview } from "../types"
import { UserAddressEntity } from "../interfaces"

export class GeneralSearchService {
  constructor(private readonly mapper: AddressBookMapper) {}

  search(
    entities: UserAddressEntity[],
    request: SearchRequest,
  ): UserAddressPreview[] {
    const searchLower = request.address.toLowerCase()

    return entities.flatMap((entity) =>
      entity.addresses
        .filter((address) => address.value.toLowerCase().includes(searchLower))
        .map((address) => this.mapper.toPreview(entity, address)),
    )
  }
}
