import React from "react"

import Dfinity from "frontend/assets/dfinity.svg"
import ProfileAssetsPage from "frontend/ui/pages/new-profile/assets"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "./routes"

const ProfileAssets = () => {
  const { navigate } = useNFIDNavigate()

  return (
    <ProfileAssetsPage
      onIconClick={() =>
        navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`)
      }
      tokens={Array(1).fill({
        icon: Dfinity,
        title: "Internet Computer",
        subTitle: "ICP",
        balance: "987.12345678 ICP",
        price: "$6.91",
      })}
    />
  )
}

export default ProfileAssets
