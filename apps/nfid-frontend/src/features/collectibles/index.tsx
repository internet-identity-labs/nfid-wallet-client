import { NFTs } from "packages/ui/src/organisms/nfts"
import useSWR from "swr"

import { searchTokens } from "frontend/features/collectibles/utils/util"

import { fetchNFTs } from "./utils/util"

const ProfileCollectiblesPage = () => {
  const { data: nfts = [], isLoading } = useSWR("nfts", fetchNFTs)

  return <NFTs nfts={nfts} isLoading={isLoading} searchTokens={searchTokens} />
}

export default ProfileCollectiblesPage
