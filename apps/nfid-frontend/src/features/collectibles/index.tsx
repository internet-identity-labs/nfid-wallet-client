import { NFTs } from "packages/ui/src/organisms/profile-tabs/nfts"
import useSWR from "swr"

import { fetchNFTs } from "./utils/util"

const ProfileCollectiblesPage = () => {
  const { data: nfts = [], isLoading } = useSWR("nfts", fetchNFTs)

  return <NFTs nfts={nfts} isLoading={isLoading} />
}

export default ProfileCollectiblesPage
