export interface NftInfo {
  id: number
  nft_collection_id: number
  canister: string
  token_id: string
  token_name: string
  mime_type: string
  owner_of: string | null
  token_uri: string | null
  metadata: string
  minter_address: string | null
  media_url: string
  thumbnail_url: string
  properties: string | null
  updated_at: string
}

export interface TransactionRecordData {
  id: number
  canister: string
  token_id: string
  caller: string | null
  eventType: string
  from: string | null
  to: string | null
  fromAid: string | null
  toAid: string | null
  token_symbol: string
  token_amount: string
  usd_price: string
  created_at: string
  nft_info: NftInfo
}

export interface PageInfo {
  all_count: number
  page_count: number
  page: number
  limit: number
}

export interface ResponseData {
  message: string
  data: TransactionRecordData[]
  page: PageInfo
}

export interface ApiResponse {
  code: number
  msg: string
  data: ResponseData
}