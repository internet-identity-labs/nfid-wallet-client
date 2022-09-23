import React from "react"

import { ProfileNFTNotPresent } from "./not-present-nft"
import { ProfileNFTPresent } from "./present-nft"

interface IProfileAssetsNFT extends React.HTMLAttributes<HTMLDivElement> {
  nfts: any[]
}

export const ProfileAssetsNFT: React.FC<IProfileAssetsNFT> = ({ nfts }) => {
  if (nfts.length) return <ProfileNFTPresent nfts={nfts} />
  else return <ProfileNFTNotPresent />
}
