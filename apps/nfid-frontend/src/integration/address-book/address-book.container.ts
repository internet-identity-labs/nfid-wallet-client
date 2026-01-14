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
import { IcExplorerClient } from "./client/ic-explorer.client"
import { IcExplorerMapper } from "./mapper/ic-explorer.mapper"
import { IcExplorerService } from "./service/ic-explorer.service"

const addressBookMapper = new AddressBookMapper()
const addressBookCanisterMapper = new AddressBookCanisterMapper()
const searchFilterService = new SearchFilterService()

export const icExplorerClient = new IcExplorerClient()
const icExplorerMapper = new IcExplorerMapper()
export const icExplorerService = new IcExplorerService(
  icExplorerClient,
  icExplorerMapper,
)

const ftSearchService = new FtSearchService(
  addressBookMapper,
  searchFilterService,
)
const nftSearchService = new NftSearchService(
  addressBookMapper,
  searchFilterService,
)
const generalSearchService = new GeneralSearchService(
  addressBookMapper,
  icExplorerService,
)

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
