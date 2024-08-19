import { NFTs } from "packages/ui/src/organisms/profile-tabs/nfts"
import { useEffect } from "react"
import useSWR from "swr"

import { fetchNFTs } from "./utils/util"

const ProfileCollectiblesPage = () => {
  //const { data: nfts = [], isLoading } = useSWR("nfts1", fetchNFTs)\

  const getNfts = async () => {
    const aa = await fetchNFTs()
    console.log(aa)
  }
  useEffect(() => {
    getNfts()
  }, [])

  // return <NFTs nfts={nfts} isLoading={isLoading} />
  return <>123</>
}

export default ProfileCollectiblesPage
