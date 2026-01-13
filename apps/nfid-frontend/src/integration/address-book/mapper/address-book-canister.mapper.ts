import {
  AddressBookUserAddress as CanisterUserAddress,
  AddressBookAddress as CanisterAddress,
  AddressBookAddressType as CanisterAddressType,
} from "@nfid/integration"

import { UserAddressEntity } from "../interfaces"
import { Address, AddressType } from "../types"

export class AddressBookCanisterMapper {
  toCanisterUserAddress(address: UserAddressEntity): CanisterUserAddress {
    return {
      id: address.id,
      name: address.name,
      addresses: address.addresses.map((item) => this.toCanisterAddress(item)),
    }
  }

  toUserAddressEntity(address: CanisterUserAddress): UserAddressEntity {
    return {
      id: address.id,
      name: address.name,
      addresses: address.addresses.map((item) => this.toAddress(item)),
    }
  }

  private toCanisterAddress(address: Address): CanisterAddress {
    return {
      address_type: this.toCanisterAddressType(address.type),
      value: address.value,
    }
  }

  private toAddress(address: CanisterAddress): Address {
    return {
      type: this.toAddressType(address.address_type),
      value: address.value,
    }
  }

  private toCanisterAddressType(type: AddressType): CanisterAddressType {
    switch (type) {
      case AddressType.ICP_PRINCIPAL:
        return { IcpPrincipal: null }
      case AddressType.ICP_ADDRESS:
        return { IcpAddress: null }
      case AddressType.BTC:
        return { BTC: null }
      case AddressType.ETH:
        return { ETH: null }
    }
  }

  private toAddressType(type: CanisterAddressType): AddressType {
    if ("IcpPrincipal" in type) return AddressType.ICP_PRINCIPAL
    if ("IcpAddress" in type) return AddressType.ICP_ADDRESS
    if ("BTC" in type) return AddressType.BTC
    if ("ETH" in type) return AddressType.ETH
    throw new Error(`Unknown canister address type: ${JSON.stringify(type)}`)
  }
}
