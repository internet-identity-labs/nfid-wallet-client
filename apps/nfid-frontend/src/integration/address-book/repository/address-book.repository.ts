import { AddressBookCache } from "../cache/address-book.cache"
import { UserAddressId, UserAddressPreview, AddressType } from "../types"
import { UserAddressEntity } from "../interfaces"
import { AddressBookCanisterClient } from "../client/address-book-canister.client"
import { AddressHashIndex } from "../index/hash.index"
import { FullTextIndex } from "../index/full-text.index"

export class AddressBookRepository {
  constructor(
    private cache: AddressBookCache,
    private canisterClient: AddressBookCanisterClient,
    private addressHashIndex: AddressHashIndex,
    private fullTextIndex: FullTextIndex,
  ) {}

  async findAll(): Promise<Array<UserAddressEntity>> {
    await this.ensureCacheLoaded()
    const entitiesMap = this.cache.getCache()
    return Array.from(entitiesMap.values())
  }

  async save(entity: UserAddressEntity): Promise<void> {
    const updatedEntities = await this.canisterClient.save(entity)
    this.updateCacheAndIndexes(updatedEntities)
  }

  async update(entity: UserAddressEntity): Promise<void> {
    if (!entity.id) {
      throw new Error("Cannot update address without id")
    }

    const updatedEntities = await this.canisterClient.save(entity)
    this.updateCacheAndIndexes(updatedEntities)
  }

  async delete(id: UserAddressId): Promise<void> {
    const updatedEntities = await this.canisterClient.delete(id)
    this.updateCacheAndIndexes(updatedEntities)
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

  async findByAddress(
    addressValue: string,
  ): Promise<UserAddressPreview | undefined> {
    await this.ensureCacheLoaded()
    return this.addressHashIndex.find(addressValue)
  }

  async searchByNameOrAddressAndType(
    query: string,
    type: AddressType,
  ): Promise<UserAddressPreview[]> {
    await this.ensureCacheLoaded()
    return this.fullTextIndex.searchByNameOrAddressAndType(query, type)
  }

  async searchByAddressAndType(
    query: string,
    type: AddressType,
  ): Promise<UserAddressPreview[]> {
    await this.ensureCacheLoaded()
    return this.fullTextIndex.searchByAddressAndType(query, type)
  }

  async searchByType(type: AddressType): Promise<UserAddressPreview[]> {
    await this.ensureCacheLoaded()
    return this.fullTextIndex.searchByType(type)
  }

  private async ensureCacheLoaded(): Promise<void> {
    if (!this.cache.isLoaded()) {
      const entities = await this.canisterClient.findAll()
      this.updateCacheAndIndexes(entities)
    }
  }

  private updateCacheAndIndexes(entities: Array<UserAddressEntity>): void {
    this.cache.updateFromBackend(entities)
    this.addressHashIndex.rebuild(entities)
    this.fullTextIndex.rebuild(entities)
  }
}
