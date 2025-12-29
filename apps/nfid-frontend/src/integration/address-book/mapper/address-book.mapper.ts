import { v4 as uuidv4 } from "uuid"
import {
  Address,
  AddressType,
  UserAddressPreview,
  UserAddress,
  UserAddressSaveRequest,
} from "../types"
import { UserAddressEntity } from "../interfaces"

export class AddressBookMapper {
  toUserAddressEntity(userAddress: UserAddress): UserAddressEntity {
    const addressMappings: Array<[AddressType, keyof UserAddress]> = [
      [AddressType.ICP_PRINCIPAL, "icpPrincipal"],
      [AddressType.ICP_ADDRESS, "icpAccountId"],
      [AddressType.BTC, "btc"],
      [AddressType.ETH, "evm"],
    ]

    const addresses = addressMappings
      .map(([type, key]) => ({ type, value: userAddress[key] }))
      .filter((a): a is Address => Boolean(a.value))

    return {
      id: userAddress.id,
      name: userAddress.name,
      addresses,
    }
  }

  toUserAddress(entity: UserAddressEntity): UserAddress {
    const addresses = entity.addresses.reduce(
      (acc, addr) => {
        switch (addr.type) {
          case AddressType.ICP_PRINCIPAL:
            acc.icpPrincipal = addr.value
            break
          case AddressType.ICP_ADDRESS:
            acc.icpAccountId = addr.value
            break
          case AddressType.BTC:
            acc.btc = addr.value
            break
          case AddressType.ETH:
            acc.evm = addr.value
            break
        }
        return acc
      },
      {} as Pick<UserAddress, "icpPrincipal" | "icpAccountId" | "btc" | "evm">,
    )

    return {
      id: entity.id,
      name: entity.name,
      ...addresses,
    }
  }

  toUserAddressEntityByRequest(
    request: UserAddressSaveRequest,
  ): UserAddressEntity {
    const userAddressWithId: UserAddress = {
      ...request,
      id: uuidv4(),
    }
    return this.toUserAddressEntity(userAddressWithId)
  }

  toPreview(entity: UserAddressEntity, address: Address): UserAddressPreview {
    return {
      id: entity.id,
      name: entity.name,
      address,
    }
  }
}
