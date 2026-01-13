import { ChainId, Category } from "@nfid/integration/token/icrc1/enum/enums"

import { UserAddressEntity } from "../interfaces"
import { AddressBookMapper } from "../mapper/address-book.mapper"
import {
  Address,
  AddressType,
  FtSearchRequest,
  UserAddressPreview,
} from "../types"

import { SearchFilterService } from "./search-filter.service"

export class FtSearchService {
  constructor(
    private readonly mapper: AddressBookMapper,
    private readonly service: SearchFilterService,
  ) {}

  search(
    entities: UserAddressEntity[],
    request: FtSearchRequest,
  ): UserAddressPreview[] {
    const { chainId, category, addressLike, nameOrAddressLike } = request

    return entities
      .map((entity) => {
        const address = this.findAddress(entity.addresses, chainId, category)
        return address ? { entity, address } : null
      })
      .filter(
        (item): item is { entity: UserAddressEntity; address: Address } =>
          item !== null,
      )
      .filter((item) =>
        this.service.matchesAddressLike(item.address.value, addressLike),
      )
      .filter((item) =>
        this.service.matchesNameOrAddressLike(
          item.entity.name,
          item.address.value,
          nameOrAddressLike,
        ),
      )
      .map((item) => this.mapper.toPreview(item.entity, item.address))
  }

  private findAddress(
    addresses: Address[],
    chainId: ChainId,
    category: Category,
  ): Address | null {
    const type = this.getAddressType(chainId, category)
    return type ? (addresses.find((a) => a.type === type) ?? null) : null
  }

  private getAddressType(
    chainId: ChainId,
    category: Category,
  ): AddressType | undefined {
    if (chainId === ChainId.ICP && category === Category.Native)
      return AddressType.ICP_ADDRESS
    if (chainId === ChainId.ICP) return AddressType.ICP_PRINCIPAL
    if (chainId === ChainId.BTC) return AddressType.BTC
    if (chainId > ChainId.ICP) return AddressType.ETH
  }
}
