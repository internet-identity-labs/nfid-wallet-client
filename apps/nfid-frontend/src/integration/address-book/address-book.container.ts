import { Storage } from "@nfid/client-db"

import { AddressBookCache } from "./cache/address-book.cache"
import { DefaultAddressBookFacade } from "./address-book.facade"
import { AddressBookRepository } from "./repository/address-book.repository"
import { AddressBookMapper } from "./mapper/address-book.mapper"
import { UserAddressEntity } from "./interfaces"
import { FtSearchService } from "./services/ft-search.service"
import { NftSearchService } from "./services/nft-search.service"
import { GeneralSearchService } from "./services/general-search.service"
import { SearchFilterService } from "./services/search-filter.service"

export const addressBookStorage = new Storage<UserAddressEntity>({
  dbName: "address-book-db",
  storeName: "address-book-store",
})

export const addressBookMapper = new AddressBookMapper()
export const searchFilterService = new SearchFilterService()
export const ftSearchService = new FtSearchService(
  addressBookMapper,
  searchFilterService,
)
export const nftSearchService = new NftSearchService(
  addressBookMapper,
  searchFilterService,
)
export const generalSearchService = new GeneralSearchService(addressBookMapper)
export const addressBookCache = new AddressBookCache(addressBookStorage)
export const addressBookRepository = new AddressBookRepository(
  addressBookCache,
  addressBookStorage,
)
export const addressBookFacade = new DefaultAddressBookFacade(
  addressBookRepository,
  addressBookMapper,
  ftSearchService,
  nftSearchService,
  generalSearchService,
)
