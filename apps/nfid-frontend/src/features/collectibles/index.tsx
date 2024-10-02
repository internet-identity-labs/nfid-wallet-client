import { useActor } from "@xstate/react"
import clsx from "clsx"
import { NFTs } from "packages/ui/src/organisms/nfts"
import { useEffect, useState, useCallback, MouseEvent, useContext } from "react"

import { Button } from "@nfid-frontend/ui"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { NFT } from "frontend/integration/nft/nft"
import { ProfileContext } from "frontend/provider"

import { fetchNFTs } from "./utils/util"

const NFTsPage = () => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
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
      const { items, totalItems, totalPages } = await fetchNFTs(currentPage)
      setTotalItems(totalItems)
      setTotalPages(totalPages)
      setIsLoading(false)

      const initialLoadingState = Array(items.length).fill(null)
      setNfts((prevNfts) => [...prevNfts, ...initialLoadingState])

      for (let i = 0; i < items.length; i++) {
        const nft = items[i]
        await nft.init()
        setNfts((prevNfts) => {
          const newNfts = [...prevNfts]
          newNfts[prevNfts.length - items.length + i] = nft
          return newNfts
        })
      }
    }

    loadNFTs()
  }, [currentPage])

  return (
    <>
      <NFTs
        nfts={nfts}
        isLoading={isLoading}
        searchTokens={searchTokens}
        links={ProfileConstants}
        onTransferNFT={onTransferNFT}
        totalItems={totalItems}
      />
      <Button
        disabled={isLoading}
        className={clsx(
          "block mx-auto",
          totalPages === currentPage && "hidden",
        )}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        type="ghost"
      >
        {isLoading ? "Loading..." : "Load more"}
      </Button>
    </>
  )
}

export default NFTsPage
