import { Actor } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { createAgent } from "@dfinity/utils"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { idlFactory } from "../idl/address_book_idl"
import { _SERVICE as AddressBookCanister } from "../idl/address_book"
import { UserAddressEntity } from "../interfaces"
import { AddressBookCanisterMapper } from "../mapper/address-book-canister.mapper"

export class AddressBookCanisterClient {
  constructor(private mapper: AddressBookCanisterMapper) {}

  private async getActor(): Promise<AddressBookCanister> {
    const identity = await getWalletDelegation()
    const agent = await createAgent({
      identity,
      host: IC_HOST,
    })

    return Actor.createActor(idlFactory, {
      agent,
      canisterId: Principal.fromText(ADDRESS_BOOK_CANISTER_ID),
    })
  }

  async save(entity: UserAddressEntity): Promise<Array<UserAddressEntity>> {
    const actor = await this.getActor()
    const canisterAddress = this.mapper.toCanisterUserAddress(entity)
    const result = await actor.save(canisterAddress)

    if ("Err" in result) {
      throw new Error(`Failed to save address: ${JSON.stringify(result.Err)}`)
    }

    return result.Ok.map((address) => this.mapper.toUserAddressEntity(address))
  }

  async delete(id: string): Promise<Array<UserAddressEntity>> {
    const actor = await this.getActor()
    const result = await actor.delete(id)

    if ("Err" in result) {
      throw new Error(`Failed to delete address: ${JSON.stringify(result.Err)}`)
    }

    return result.Ok.map((address) => this.mapper.toUserAddressEntity(address))
  }

  async findAll(): Promise<Array<UserAddressEntity>> {
    const actor = await this.getActor()
    const result = await actor.find_all()

    if ("Err" in result) {
      throw new Error(
        `Failed to fetch addresses: ${JSON.stringify(result.Err)}`,
      )
    }

    return result.Ok.map((address) => this.mapper.toUserAddressEntity(address))
  }

  async deleteAll(): Promise<void> {
    const actor = await this.getActor()
    const result = await actor.delete_all()

    if ("Err" in result) {
      throw new Error(
        `Failed to delete all addresses: ${JSON.stringify(result.Err)}`,
      )
    }
  }
}
