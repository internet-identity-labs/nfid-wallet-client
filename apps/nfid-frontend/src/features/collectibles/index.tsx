import { useActor } from "@xstate/react"
import { NFTs } from "packages/ui/src/organisms/nfts"
import { useEffect, useState, useCallback, MouseEvent, useContext } from "react"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { NFT } from "frontend/integration/nft/nft"
import { ProfileContext } from "frontend/provider"

import { fetchNFTs } from "./utils/util"

interface LoadingNFT {
  nft: NFT | null
  isLoading: boolean
}

const ProfileCollectiblesPage = () => {
  const [nfts, setNfts] = useState<LoadingNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const onTransferNFT = useCallback(
    (e: MouseEvent<HTMLDivElement>, id: string) => {
      e.preventDefault()

      send({ type: "ASSIGN_SELECTED_NFT", data: id })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: "send" })

      send("SHOW")
    },
    [send],
  )

  useEffect(() => {
    const loadNFTs = async () => {
      setIsLoading(true)
      const allNFTs = await fetchNFTs()

      const initialLoadingState: LoadingNFT[] = allNFTs.map(() => ({
        nft: null,
        isLoading: true,
      }))
      setNfts(initialLoadingState)

      for (let i = 0; i < allNFTs.length; i++) {
        const nft = allNFTs[i]
        await nft.init()

        setNfts((prevNfts) =>
          prevNfts.map((item, index) =>
            index === i ? { nft, isLoading: false } : item,
          ),
        )
      }

      setIsLoading(false)
    }

    loadNFTs()
  }, [])

  const loadedNfts = nfts.filter((item) => item.nft !== null) as { nft: NFT }[]

  return (
    <NFTs
      nfts={loadedNfts.map(({ nft }) => nft)}
      isLoading={isLoading}
      searchTokens={searchTokens}
      links={ProfileConstants}
      onTransferNFT={onTransferNFT}
    />
  )
}

export default ProfileCollectiblesPage
