import React from "react"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"

import { ProfileNFTNotPresent } from "./not-present-nft"
import { ProfileNFTPresent } from "./present-nft"

interface IProfileAssetsNFT extends React.HTMLAttributes<HTMLDivElement> {
  nfts?: UserNonFungibleToken[]
}

export const ProfileAssetsNFT: React.FC<IProfileAssetsNFT> = ({ nfts }) => {
  if (nfts && nfts.length) return <ProfileNFTPresent nfts={nfts} />
  else return <ProfileNFTNotPresent nfts={nfts} />
}
