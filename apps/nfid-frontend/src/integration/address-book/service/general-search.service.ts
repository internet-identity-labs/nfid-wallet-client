import { AddressBookMapper } from "../mapper/address-book.mapper"
import { SearchRequest, UserAddressPreview } from "../types"
import { UserAddressEntity } from "../interfaces"
import { IcExplorerService } from "../service/ic-explorer.service"

export class GeneralSearchService {
  constructor(
    private readonly mapper: AddressBookMapper,
    private readonly icExplorerService: IcExplorerService,
  ) {}

  async search(
    entities: UserAddressEntity[],
    request: SearchRequest,
  ): Promise<UserAddressPreview | undefined> {
    const found = entities
      .flatMap((entity) =>
        entity.addresses.map((address) => ({ entity, address })),
      )
      .find(({ address }) => address.value === request.address)

    if (found) {
      return this.mapper.toPreview(found.entity, found.address)
    }

    return await this.icExplorerService
      .find(request.address)
      .catch(() => undefined)
  }
}
