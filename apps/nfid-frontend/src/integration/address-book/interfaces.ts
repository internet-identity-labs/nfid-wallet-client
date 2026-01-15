import { UserAddressId, Address } from "./types"

export interface UserAddressEntity {
  id: UserAddressId
  name: string
  addresses: Array<Address>
}
