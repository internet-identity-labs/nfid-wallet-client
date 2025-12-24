import { AddressBookCache } from "../cache/address-book.cache"
import { UserAddressId } from "../types"
import { UserAddressEntity } from "../interfaces"
import { AddressBookCanisterClient } from "../client/address-book-canister.client"

export class AddressBookRepository {
  constructor(
    private cache: AddressBookCache,
    private canisterClient: AddressBookCanisterClient,
  ) {}

  async findAll(): Promise<Array<UserAddressEntity>> {
    await this.ensureCacheLoaded()
    const entitiesMap = this.cache.getCache()
    return Array.from(entitiesMap.values())
  }

  async save(entity: UserAddressEntity): Promise<void> {
    const updatedEntities = await this.canisterClient.save(entity)
    this.cache.updateFromBackend(updatedEntities)
  }

  async update(entity: UserAddressEntity): Promise<void> {
    if (!entity.id) {
      throw new Error("Cannot update address without id")
    }

    const updatedEntities = await this.canisterClient.save(entity)
    this.cache.updateFromBackend(updatedEntities)
  }

  async delete(id: UserAddressId): Promise<void> {
    const updatedEntities = await this.canisterClient.delete(id)
    this.cache.updateFromBackend(updatedEntities)
  }

  async get(id: UserAddressId): Promise<UserAddressEntity> {
    await this.ensureCacheLoaded()
    const entities = this.cache.getCache()
    const entity = entities.get(id)

    if (!entity) {
      throw new Error(`Address with id ${id} not found`)
    }

    return entity
  }

  private async ensureCacheLoaded(): Promise<void> {
    if (!this.cache.isLoaded()) {
      const entities = await this.canisterClient.findAll()
      this.cache.updateFromBackend(entities)
    }
  }
}
