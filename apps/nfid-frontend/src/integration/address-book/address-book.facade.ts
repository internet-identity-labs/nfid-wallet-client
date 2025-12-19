import { AddressBookRepository } from "./repository/address-book.repository"
import { AddressBookMapper } from "./mapper/address-book.mapper"
import { FtSearchService } from "./services/ft-search.service"
import { NftSearchService } from "./services/nft-search.service"
import { GeneralSearchService } from "./services/general-search.service"
import {
  AddressBookFacade,
  FtSearchRequest,
  NftSearchRequest,
  SearchRequest,
  UserAddressId,
  UserAddressPreview,
  UserAddress,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "./types"

export class DefaultAddressBookFacade implements AddressBookFacade {
  constructor(
    private repository: AddressBookRepository,
    private mapper: AddressBookMapper,
    private ftSearchService: FtSearchService,
    private nftSearchService: NftSearchService,
    private generalSearchService: GeneralSearchService,
  ) {}

  async findAll(): Promise<Array<UserAddress>> {
    const entities = await this.repository.findAll()
    return entities
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entity) => this.mapper.toUserAddress(entity))
  }

  async save(request: UserAddressSaveRequest): Promise<void> {
    const entity = this.mapper.toUserAddressEntityByRequest(request)
    await this.repository.save(entity)
  }

  async update(request: UserAddressUpdateRequest): Promise<void> {
    const entity = this.mapper.toUserAddressEntity(request)
    await this.repository.update(entity)
  }

  async delete(id: UserAddressId): Promise<void> {
    await this.repository.delete(id)
  }

  async get(id: UserAddressId): Promise<UserAddress> {
    const entity = await this.repository.get(id)
    return this.mapper.toUserAddress(entity)
  }

  async ftSearch(request: FtSearchRequest): Promise<Array<UserAddressPreview>> {
    const entities = await this.repository.findAll()
    return this.ftSearchService.search(entities, request)
  }

  async nftSearch(
    request?: NftSearchRequest,
  ): Promise<Array<UserAddressPreview>> {
    const entities = await this.repository.findAll()
    return this.nftSearchService.search(entities, request)
  }

  async search(request: SearchRequest): Promise<Array<UserAddressPreview>> {
    const entities = await this.repository.findAll()
    return this.generalSearchService.search(entities, request)
  }
}
