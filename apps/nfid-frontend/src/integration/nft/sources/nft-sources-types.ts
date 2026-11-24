import { MarketPlace } from "src/integration/nft/enum/enums"

/**
 * An ICP NFT owned by the user, as loaded from its source (Entrepot for EXT,
 * the collection canister for ICRC-7). Plain JSON so it can be cached.
 */
export interface IcpNftToken {
  marketPlace: MarketPlace.EXT | MarketPlace.ICRC7
  /** EXT token identifier, or `<collectionId>:<tokenId>` for ICRC-7. */
  tokenId: string
  /** Token index (EXT) or token id (ICRC-7). */
  tokenNumber: number
  collectionId: string
  collectionName: string
  /** When the user got the token, if known; 0 otherwise. */
  millis: number
  /** Floor price in e8s. */
  tokenFloorPriceIcp?: number
  /** ICRC-7 metadata. */
  name?: string
  image?: string
  description?: string
  collectionLogo?: string
  tradable?: boolean
  /** Custom ICRC-7 token properties as [category, option] pairs. */
  metadata?: Array<[string, string]>
}
