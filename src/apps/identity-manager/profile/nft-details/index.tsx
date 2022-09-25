import React from "react"
import { useLocation } from "react-router-dom"
import { toast } from "react-toastify"

import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { ProfileNFTDetailsPage } from "frontend/ui/pages/new-profile/nft-details"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"

const ProfileNFTDetails = () => {
  const { state } = useLocation()
  const { navigate } = useNFIDNavigate()

  if (!!!(state as { nft: UserNFTDetails }).nft) {
    toast.info("You can't open NFT by url, please open it from NFT list")
    // NFT TODO redirect to catalogue
    navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
  }

  return <ProfileNFTDetailsPage nft={(state as { nft: UserNFTDetails }).nft} />
}

export default ProfileNFTDetails
