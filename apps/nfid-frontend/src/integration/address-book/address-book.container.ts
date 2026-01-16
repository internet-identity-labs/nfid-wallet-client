import { AddressBookCache } from "./cache/address-book.cache"
import { DefaultAddressBookFacade } from "./address-book.facade"
import { AddressBookRepository } from "./repository/address-book.repository"
import { AddressBookMapper } from "./mapper/address-book.mapper"
import { AddressBookCanisterMapper } from "./mapper/address-book-canister.mapper"
import { FullTextMapper } from "./mapper/full-text.mapper"
import { FtSearchService } from "./service/ft-search.service"
import { NftSearchService } from "./service/nft-search.service"
import { GeneralSearchService } from "./service/general-search.service"
import { AddressBookCanisterClient } from "./client/address-book-canister.client"
import { IcExplorerClient } from "./client/ic-explorer.client"
import { IcExplorerMapper } from "./mapper/ic-explorer.mapper"
import { IcExplorerService } from "./service/ic-explorer.service"
import { AddressHashIndex } from "./index/hash.index"
import { FullTextIndex } from "./index/full-text.index"

const addressBookMapper = new AddressBookMapper()
const addressBookCanisterMapper = new AddressBookCanisterMapper()
const fullTextMapper = new FullTextMapper()

export const icExplorerClient = new IcExplorerClient()
const icExplorerMapper = new IcExplorerMapper()
const icExplorerService = new IcExplorerService(
  icExplorerClient,
  icExplorerMapper,
)

const addressHashIndex = new AddressHashIndex(addressBookMapper)
const fullTextIndex = new FullTextIndex(fullTextMapper)

export const addressBookCanisterClient = new AddressBookCanisterClient(
  addressBookCanisterMapper,
)
export const addressBookCache = new AddressBookCache()
const addressBookRepository = new AddressBookRepository(
  addressBookCache,
  addressBookCanisterClient,
  addressHashIndex,
  fullTextIndex,
)

const ftSearchService = new FtSearchService(addressBookRepository)
const nftSearchService = new NftSearchService(addressBookRepository)
const generalSearchService = new GeneralSearchService(
  icExplorerService,
  addressBookRepository,
)
export const addressBookFacade = new DefaultAddressBookFacade(
  addressBookRepository,
  addressBookMapper,
  ftSearchService,
  nftSearchService,
  generalSearchService,
)
