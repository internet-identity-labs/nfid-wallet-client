import { UserAddressEntity } from "../interfaces"
import { UserAddressPreview } from "../types"
import { AddressBookMapper } from "../mapper/address-book.mapper"

export class AddressHashIndex {
  private index: Map<string, UserAddressPreview> = new Map()

  constructor(private mapper: AddressBookMapper) {}

  rebuild(entities: UserAddressEntity[]): void {
    const entries = entities.flatMap((entity) =>
      entity.addresses.map(
        (address) =>
          [address.value, this.mapper.toPreview(entity, address)] as const,
      ),
    )
    this.index = new Map(entries)
  }

  find(addressValue: string): UserAddressPreview | undefined {
    return this.index.get(addressValue)
  }
}
