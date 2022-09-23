import React from "react"

import { NFTDetails } from "frontend/integration/entrepot/types"

import { ProfileNFTNotPresent } from "./not-present-nft"
import { ProfileNFTPresent } from "./present-nft"

interface IProfileAssetsNFT extends React.HTMLAttributes<HTMLDivElement> {
  nfts: NFTDetails[]
}

export const ProfileAssetsNFT: React.FC<IProfileAssetsNFT> = ({ nfts }) => {
  if (nfts && nfts.length) return <ProfileNFTPresent nfts={nfts} />
  else return <ProfileNFTNotPresent />
}
