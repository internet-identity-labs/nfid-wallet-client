import { Actor } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { createAgent } from "@dfinity/utils"

import { authState, userRegistryIdlFactory } from "@nfid/integration"
import type { UserRegistryService } from "@nfid/integration"

import { UserAddressEntity } from "../interfaces"
import { AddressBookCanisterMapper } from "../mapper/address-book-canister.mapper"

export class AddressBookCanisterClient {
  constructor(private mapper: AddressBookCanisterMapper) {}

  async save(entity: UserAddressEntity): Promise<Array<UserAddressEntity>> {
    const actor = await this.getActor()
    const canisterAddress = this.mapper.toCanisterUserAddress(entity)
    const result = await actor.address_book_save(canisterAddress)

    if ("Err" in result) {
      throw new Error(`Failed to save address: ${JSON.stringify(result.Err)}`)
    }

    return result.Ok.map((address) => this.mapper.toUserAddressEntity(address))
  }

  async delete(id: string): Promise<Array<UserAddressEntity>> {
    const actor = await this.getActor()
    const result = await actor.address_book_delete(id)

    if ("Err" in result) {
      throw new Error(`Failed to delete address: ${JSON.stringify(result.Err)}`)
    }

    return result.Ok.map((address) => this.mapper.toUserAddressEntity(address))
  }

  async findAll(): Promise<Array<UserAddressEntity>> {
    const actor = await this.getActor()
    const result = await actor.address_book_find_all()

    if ("Err" in result) {
      throw new Error(
        `Failed to fetch addresses: ${JSON.stringify(result.Err)}`,
      )
    }

    return result.Ok.map((address) => this.mapper.toUserAddressEntity(address))
  }

  async deleteAll(): Promise<void> {
    const actor = await this.getActor()
    const result = await actor.address_book_delete_all()

    if ("Err" in result) {
      throw new Error(
        `Failed to delete all addresses: ${JSON.stringify(result.Err)}`,
      )
    }
  }

  private async getActor(): Promise<UserRegistryService> {
    const identity = authState.get().delegationIdentity!
    const agent = await createAgent({
      identity,
      host: IC_HOST,
    })

    return Actor.createActor(userRegistryIdlFactory, {
      agent,
      canisterId: Principal.fromText(USER_REGISTRY_CANISTER_ID),
    })
  }
}
