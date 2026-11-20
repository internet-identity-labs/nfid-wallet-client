import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { Marketplace } from "packages/ui/src/organisms/marketplace"
import { memo, useCallback, useContext } from "react"
import { useLocation } from "react-router-dom"
import { MarketplaceType } from "packages/ui/src/organisms/marketplace/types"

import { useSWR } from "@nfid/swr"

import { ProfileContext } from "frontend/provider"

import { fetchListings, fetchSellerListings } from "./utils"
import { ModalType } from "../transfer-modal/types"

const MarketplacePage = memo(() => {
  const { isViewOnlyMode, transferService } = useContext(ProfileContext)
  const location = useLocation()
  const initialTab = (location.state as { tab?: MarketplaceType } | null)?.tab

  const { data: listings = [], isLoading: isListingsLoading } = useSWR(
    "listings",
    () => fetchListings({ sort: "Newest" }),
    { revalidateOnFocus: false },
  )

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
        isListingsLoading={isListingsLoading}
        isSellerListingsLoading={isSellerListingsLoading}
        onBuy={onBuy}
        onDelist={onDelist}
        onList={onList}
        sellerListings={sellerListings}
        initialTab={initialTab}
        isViewOnlyMode={isViewOnlyMode}
      />
    </ProfileContainer>
  )
})

export default MarketplacePage
