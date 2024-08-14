import { Principal } from "@dfinity/principal"
import { NFTs } from "packages/ui/src/organisms/profile-tabs/nfts"
import { useEffect, useState } from "react"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { NFT } from "frontend/integration/nft/nft"
import { nftService } from "frontend/integration/nft/nft-service"

import { useAllNFTs } from "../../apps/identity-manager/profile/assets/hooks"

const ProfileCollectiblesPage = () => {
  // const { nfts, isLoading } = useAllNFTs()
  const applications = useApplicationsMeta()

  const [nfts, setNfts] = useState<NFT[]>([])

  const getNFTs = async () => {
    const { publicKey } = await getLambdaCredentials()
    const principal = Principal.fromText(publicKey)
    const data = await nftService.getNFTs(principal)

    setNfts(data.items)
  }
  useEffect(() => {
    getNFTs()
  }, [])

  return <NFTs nfts={nfts} isLoading={false} />
}

export default ProfileCollectiblesPage
