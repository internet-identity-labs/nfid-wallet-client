import { AddressType, NftSearchRequest, UserAddressPreview } from "../types"
import { AddressBookRepository } from "../repository/address-book.repository"

export class NftSearchService {
  constructor(private readonly repository: AddressBookRepository) {}

  async search(request?: NftSearchRequest): Promise<UserAddressPreview[]> {
    const type = AddressType.ICP_PRINCIPAL

    if (request?.addressLike) {
      return this.repository.searchByAddressAndType(request.addressLike, type)
    }

    if (request?.nameOrAddressLike) {
      return this.repository.searchByNameOrAddressAndType(
        request.nameOrAddressLike,
        type,
      )
    }

    return this.repository.searchByType(type)
  }
}
