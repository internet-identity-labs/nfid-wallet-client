import { UserAddress, UserAddressSaveRequest, AddressType } from "./types"
import { UserAddressEntity } from "./interfaces"

export const ALICE_SAVE_REQUEST: UserAddressSaveRequest = {
  name: "Alice",
  icpPrincipal: "aaaaa-aa",
  icpAccountId:
    "d4685b31b51450508aff0cd71cda68ec6f6b7b9c9a4e7c3d8d1b8e3d9f5e7c2a",
  btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  evm: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
}

export const BOB_SAVE_REQUEST: UserAddressSaveRequest = {
  name: "Bob",
  icpPrincipal: "bbbbb-bb",
  icpAccountId:
    "e5796c42c62561619bgg1de82deb79fd7g7c8c0a5b5f8d4e9e2c9f4e0a6f8d3b",
}

export const CHARLIE_SAVE_REQUEST: UserAddressSaveRequest = {
  name: "Charlie",
  btc: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  evm: "0x8B3192f5eEBD8579568A2Ed41E6FEB402f93f73F",
}

export const ALICE: UserAddress = {
  id: "alice-uuid-1234",
  ...ALICE_SAVE_REQUEST,
}

export const BOB: UserAddress = {
  id: "bob-uuid-5678",
  ...BOB_SAVE_REQUEST,
}

export const CHARLIE: UserAddress = {
  id: "charlie-uuid-9012",
  ...CHARLIE_SAVE_REQUEST,
}

export const ALICE_ENTITY: UserAddressEntity = {
  id: "alice-uuid-1234",
  name: "Alice",
  addresses: [
    { type: AddressType.ICP_PRINCIPAL, value: "aaaaa-aa" },
    {
      type: AddressType.ICP_ADDRESS,
      value: "d4685b31b51450508aff0cd71cda68ec6f6b7b9c9a4e7c3d8d1b8e3d9f5e7c2a",
    },
    {
      type: AddressType.BTC,
      value: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    {
      type: AddressType.ETH,
      value: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    },
  ],
}

export const BOB_ENTITY: UserAddressEntity = {
  id: "bob-uuid-5678",
  name: "Bob",
  addresses: [
    { type: AddressType.ICP_PRINCIPAL, value: "bbbbb-bb" },
    {
      type: AddressType.ICP_ADDRESS,
      value: "e5796c42c62561619bgg1de82deb79fd7g7c8c0a5b5f8d4e9e2c9f4e0a6f8d3b",
    },
  ],
}

export const CHARLIE_ENTITY: UserAddressEntity = {
  id: "charlie-uuid-9012",
  name: "Charlie",
  addresses: [
    {
      type: AddressType.BTC,
      value: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    },
    {
      type: AddressType.ETH,
      value: "0x8B3192f5eEBD8579568A2Ed41E6FEB402f93f73F",
    },
  ],
}
