export interface CollectionLink {
  twitter?: string[]
  instagram?: string[]
  discord?: string[]
  yoursite?: string[]
  telegram?: string[]
  medium?: string[]
}

export interface CollectionData {
  id: number
  canister: string
  standard: string
  controller: string | null
  name: string
  symbol: string | null
  supply: number
  description: string
  url: string | null
  featured: string
  logo: string
  banner: string
  links: CollectionLink[]
  royalties: string
  release_time: string
  creator: string
  floor_price: string
  owner_count: number | null
  volume: string
  change_rate: string
  listing_size: number
  channel: string
  updated_at: string
  create_time: string
  synced_at: string | null
}

export interface CollectionResponse {
  code: number
  msg: string
  data: CollectionData
}
