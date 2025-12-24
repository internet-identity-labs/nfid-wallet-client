import { AddressBookCache } from "./cache/address-book.cache"
import { DefaultAddressBookFacade } from "./address-book.facade"
import { AddressBookRepository } from "./repository/address-book.repository"
import { AddressBookMapper } from "./mapper/address-book.mapper"
import { AddressBookCanisterMapper } from "./mapper/address-book-canister.mapper"
import { FtSearchService } from "./services/ft-search.service"
import { NftSearchService } from "./services/nft-search.service"
import { GeneralSearchService } from "./services/general-search.service"
import { SearchFilterService } from "./services/search-filter.service"
import { AddressBookCanisterClient } from "./client/address-book-canister.client"

const addressBookMapper = new AddressBookMapper()
const addressBookCanisterMapper = new AddressBookCanisterMapper()
const searchFilterService = new SearchFilterService()
const ftSearchService = new FtSearchService(
  addressBookMapper,
  searchFilterService,
)
const nftSearchService = new NftSearchService(
  addressBookMapper,
  searchFilterService,
)
const generalSearchService = new GeneralSearchService(addressBookMapper)

export const addressBookCanisterClient = new AddressBookCanisterClient(
  addressBookCanisterMapper,
)
export const addressBookCache = new AddressBookCache()
export const addressBookRepository = new AddressBookRepository(
  addressBookCache,
  addressBookCanisterClient,
)
export const addressBookFacade = new DefaultAddressBookFacade(
  addressBookRepository,
  addressBookMapper,
  ftSearchService,
  nftSearchService,
  generalSearchService,
)
