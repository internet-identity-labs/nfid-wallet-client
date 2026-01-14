import { Cache } from "node-ts-cache"
import { indexedDbCache } from "@nfid/integration"
import { IcExplorerClient } from "../client/ic-explorer.client"
import { IcExplorerMapper } from "../mapper/ic-explorer.mapper"
import { UserAddressPreview } from "../types"

export class IcExplorerService {
  constructor(
    private client: IcExplorerClient,
    private mapper: IcExplorerMapper,
  ) {}

  @Cache(indexedDbCache, { ttl: 2592000 }) // Cache for 30 days
  async find(keyword: string): Promise<UserAddressPreview | undefined> {
    const response = await this.client.find(keyword)
    return this.mapper.toUserAddressPreview(response, keyword)
  }
}
