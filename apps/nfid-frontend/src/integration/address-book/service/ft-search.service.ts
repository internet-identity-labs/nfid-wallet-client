import { ChainId, Category } from "@nfid/integration/token/icrc1/enum/enums"
import { AddressType, FtSearchRequest, UserAddressPreview } from "../types"
import { AddressBookRepository } from "../repository/address-book.repository"

export class FtSearchService {
  constructor(private readonly repository: AddressBookRepository) {}

  async search(request: FtSearchRequest): Promise<UserAddressPreview[]> {
    const { chainId, category, addressLike, nameOrAddressLike } = request
    const type = this.getAddressType(chainId, category)

    if (!type) return []

    if (addressLike) {
      return this.repository.searchByAddressAndType(addressLike, type)
    }

    if (nameOrAddressLike) {
      return this.repository.searchByNameOrAddressAndType(
        nameOrAddressLike,
        type,
      )
    }

    return this.repository.searchByType(type)
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
