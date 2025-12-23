import { AddressBookMapper } from "../mapper/address-book.mapper"
import {
  Address,
  AddressType,
  NftSearchRequest,
  UserAddressPreview,
} from "../types"
import { UserAddressEntity } from "../interfaces"
import { SearchFilterService } from "./search-filter.service"

export class NftSearchService {
  constructor(
    private readonly mapper: AddressBookMapper,
    private readonly service: SearchFilterService,
  ) {}

  search(
    entities: UserAddressEntity[],
    request?: NftSearchRequest,
  ): UserAddressPreview[] {
    return entities
      .map((entity) => {
        const icpPrincipal = entity.addresses.find(
          (a) => a.type === AddressType.ICP_PRINCIPAL,
        )
        return icpPrincipal ? { entity, address: icpPrincipal } : null
      })
      .filter(
        (item): item is { entity: UserAddressEntity; address: Address } =>
          item !== null,
      )
      .filter((item) =>
        this.service.matchesAddressLike(
          item.address.value,
          request?.addressLike,
        ),
      )
      .filter((item) =>
        this.service.matchesNameOrAddressLike(
          item.entity.name,
          item.address.value,
          request?.nameOrAddressLike,
        ),
      )
      .map((item) => this.mapper.toPreview(item.entity, item.address))
  }
}
