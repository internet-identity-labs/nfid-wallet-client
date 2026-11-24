import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Marketplace } from "packages/ui/src/organisms/marketplace"
import { memo, useCallback, useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { MarketplaceType } from "packages/ui/src/organisms/marketplace/types"
import { MarketplaceListingWithFormatting } from "packages/ui/src/organisms/marketplace/types"

import { useSWR } from "@nfid/swr"

import { ProfileContext } from "frontend/provider"

import { fetchListings, fetchSellerListings, PAGE_SIZE } from "./utils"
import { ModalType } from "../transfer-modal/types"

const MarketplacePage = memo(() => {
  const { isViewOnlyMode, transferService } = useContext(ProfileContext)
  const location = useLocation()
  const initialTab = (location.state as { tab?: MarketplaceType } | null)?.tab

  const [currentPage, setCurrentPage] = useState(1)
  const [listings, setListings] = useState<MarketplaceListingWithFormatting[]>(
    [],
  )
  const [totalListings, setTotalListings] = useState(0)

  const { data: listingsPaginated, isLoading: isListingsLoading } = useSWR(
    ["listings", currentPage],
    ([, page]: [string, number]) =>
      fetchListings(page, { sort: "Newest", limit: PAGE_SIZE }),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!listingsPaginated) return
    setListings((prev) =>
      currentPage === 1
        ? listingsPaginated.items
        : [...prev, ...listingsPaginated.items],
    )
    setTotalListings(listingsPaginated.total)
  }, [listingsPaginated, currentPage])

  const totalPages = Math.ceil(totalListings / PAGE_SIZE)
  const hasMore = currentPage < totalPages
  const isLoadMoreLoading = isListingsLoading && currentPage > 1

  const { data: sellerListings = [], isLoading: isSellerListingsLoading } =
    useSWR("user-listings", () => fetchSellerListings(), {
      revalidateOnFocus: false,
    })

  const onBuy = useCallback((listingId: bigint) => {
    transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
    transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.BUY_NFT })
    transferService.send({
      type: "ASSIGN_SELECTED_LISTING",
      data: { id: listingId, collectionId: "" },
    })
    transferService.send({ type: "SHOW" })
  }, [])

  const onDelist = useCallback((listingId: bigint) => {
    transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
    transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    transferService.send({
      type: "CHANGE_DIRECTION",
      data: ModalType.DELIST_NFT,
    })
    transferService.send({
      type: "ASSIGN_SELECTED_LISTING",
      data: { id: listingId, collectionId: "" },
    })
    transferService.send({ type: "SHOW" })
  }, [])

  const onList = useCallback(() => {
    transferService.send({ type: "ASSIGN_VAULTS_CANISTER", data: "" })
    transferService.send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    transferService.send({
      type: "CHANGE_DIRECTION",
      data: ModalType.LIST_NFT,
    })
    transferService.send({ type: "SHOW" })
  }, [])

  return (
    <ProfileContainer>
      <Marketplace
        listings={listings}
        isListingsLoading={isListingsLoading && currentPage === 1}
        isSellerListingsLoading={isSellerListingsLoading}
        onBuy={onBuy}
        onDelist={onDelist}
        onList={onList}
        sellerListings={sellerListings}
        initialTab={initialTab}
        isViewOnlyMode={isViewOnlyMode}
        onLoadMore={() => setCurrentPage((prev) => prev + 1)}
        hasMore={hasMore}
        isLoadMoreLoading={isLoadMoreLoading}
      />
    </ProfileContainer>
  )
})

export default MarketplacePage
