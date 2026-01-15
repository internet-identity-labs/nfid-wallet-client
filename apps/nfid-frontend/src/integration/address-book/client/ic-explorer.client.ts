import { Cache } from "node-ts-cache"
import {
  icExplorerAddressItemCacheIdb,
  IcExplorerResponse,
} from "@nfid/integration"

const IC_EXPLORER_API_URL = "https://api.icexplorer.io/api/dashboard/search"

export class IcExplorerClient {
  @Cache(icExplorerAddressItemCacheIdb, { ttl: 2592000 }) // Cache for 30 days
  async find(keyword: string): Promise<IcExplorerResponse> {
    const response = await fetch(IC_EXPLORER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    })

    if (!response.ok) {
      throw new Error(
        `IC Explorer API error: ${response.status} ${response.statusText}`,
      )
    }

    return response.json()
  }
}
