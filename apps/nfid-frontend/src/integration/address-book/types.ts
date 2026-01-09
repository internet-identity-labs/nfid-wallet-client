import { ChainId, Category } from "@nfid/integration/token/icrc1/enum/enums"

export type UserAddressId = Exclude<string, "">

export enum AddressType {
  ICP_ADDRESS = "ICP_ADDRESS",
  ICP_PRINCIPAL = "ICP_PRINCIPAL",
  BTC = "BTC",
  ETH = "ETH",
}

export interface Address {
  type: AddressType
  value: string
}

export interface UserAddress {
  id: UserAddressId
  name: string
  icpPrincipal?: string
  icpAccountId?: string
  btc?: string
  evm?: string
}

export interface UserAddressPreview {
  id: UserAddressId
  name: string
  address: Address
}

export interface FtSearchRequest {
  chainId: ChainId
  category: Category
  addressLike?: string
  nameOrAddressLike?: string
}

export interface NftSearchRequest {
  addressLike?: string
  nameOrAddressLike?: string
}

export interface SearchRequest {
  address: Exclude<string, "">
}

export type UserAddressSaveRequest = Omit<UserAddress, "id">
export type UserAddressUpdateRequest = UserAddress

export interface AddressBookFacade {
  findAll(): Promise<Array<UserAddress>>
  save(request: UserAddressSaveRequest): Promise<void>
  update(request: UserAddressUpdateRequest): Promise<void>
  delete(id: UserAddressId): Promise<void>
  get(id: UserAddressId): Promise<UserAddress>
  ftSearch(request: FtSearchRequest): Promise<Array<UserAddressPreview>>
  nftSearch(request?: NftSearchRequest): Promise<Array<UserAddressPreview>>
  search(request: SearchRequest): Promise<UserAddressPreview | undefined>
}
