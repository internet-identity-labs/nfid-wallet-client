import { UserAddressId, Address } from "./types"

export interface UserAddressEntity {
  id: UserAddressId
  name: string
  addresses: Array<Address>
}

export interface IcExplorerResponse {
  statusCode: number
  message: string | null
  data: IcExplorerData
}

export interface IcExplorerData {
  tokenList: any | null
  addressList: IcExplorerAddressItem[] | null
}

export interface IcExplorerAddressItem {
  type: string | null
  symbol: string | null
  ledgerId: string | null
  priceUSD: number | null
  alias: string | null
  principalId: string | null
  accountId: string | null
  subaccountId: string | null
}
