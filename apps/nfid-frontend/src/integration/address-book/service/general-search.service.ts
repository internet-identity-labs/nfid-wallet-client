import { SearchRequest, UserAddressPreview } from "../types"
import { IcExplorerService } from "../service/ic-explorer.service"
import { AddressBookRepository } from "../repository/address-book.repository"

export class GeneralSearchService {
  constructor(
    private readonly icExplorerService: IcExplorerService,
    private readonly repository: AddressBookRepository,
  ) {}

  async search(
    request: SearchRequest,
  ): Promise<UserAddressPreview | undefined> {
    return (
      (await this.repository.findByAddress(request.address)) ??
      (await this.icExplorerService
        .find(request.address)
        .catch(() => undefined))
    )
  }
}
