import { Storage } from "@nfid/client-db"

import { AddressBookCache } from "../cache/address-book.cache"
import { UserAddressId } from "../types"
import { UserAddressEntity } from "../interfaces"

export class AddressBookRepository {
  constructor(
    private cache: AddressBookCache,
    private storage: Storage<UserAddressEntity>,
  ) {}

  async findAll(): Promise<Array<UserAddressEntity>> {
    const entitiesMap = await this.cache.getCache()
    return Array.from(entitiesMap.values())
  }

  async save(entity: UserAddressEntity): Promise<void> {
    await this.storage.set(entity.id, entity)
    await this.cache.reload()
  }

  async update(entity: UserAddressEntity): Promise<void> {
    if (!entity.id) {
      throw new Error("Cannot update address without id")
    }

    await this.storage.set(entity.id, entity)
    await this.cache.reload()
  }

  async delete(id: UserAddressId): Promise<void> {
    await this.storage.remove(id)
    await this.cache.reload()
  }

  async get(id: UserAddressId): Promise<UserAddressEntity> {
    const entities = await this.cache.getCache()
    const entity = entities.get(id)

    if (!entity) {
      throw new Error(`Address with id ${id} not found`)
    }

    return entity
  }
}
