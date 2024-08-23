import React from "react"
import { useLocation } from "react-router-dom"

import { Loader } from "@nfid-frontend/ui"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { ProfileNFTDetailsPage } from "frontend/ui/pages/new-profile/nft-details"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { useNFTActivity } from "./activity"

const ProfileNFTDetails = () => {
  const location = useLocation()
  const state = location.state as { nft?: UserNonFungibleToken }
  const applications = useApplicationsMeta()

  const nft = React.useMemo(() => {
    return state?.nft
  }, [state?.nft])

  const { transactions, isActivityFetching } = useNFTActivity(nft)

  if (!nft)
    return (
      <ProfileTemplate pageTitle="Fetching NFT...">
        <Loader isLoading={true} />
      </ProfileTemplate>
    )

  return (
    <ProfileNFTDetailsPage
      nft={nft}
      isTransactionsFetching={isActivityFetching}
      transactions={transactions}
      applications={applications.applicationsMeta || []}
    />
  )
}

export default ProfileNFTDetails
