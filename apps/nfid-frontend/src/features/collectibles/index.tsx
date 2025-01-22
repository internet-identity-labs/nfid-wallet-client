import clsx from "clsx"
import { NFTs } from "packages/ui/src/organisms/nfts"
import { useEffect, useState } from "react"

import { Button } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { NFT } from "frontend/integration/nft/nft"

import { fetchNFTs } from "./utils/util"

const DEFAULT_LIMIT_PER_PAGE = 8

const NFTsPage = () => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, isValidating } = useSWR(
    ["nftList", currentPage],
    () => fetchNFTs(currentPage, DEFAULT_LIMIT_PER_PAGE),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (!data) return
    const { items } = data
    const initialLoadingState = Array(items.length).fill(null)
    setNfts((prevNfts) => [...prevNfts, ...initialLoadingState])

    items.forEach(async (nft, i) => {
      await nft.init()
      setNfts((prevNfts) => {
        const newNfts = [...prevNfts]
        newNfts[prevNfts.length - items.length + i] = nft
        return newNfts
      })
    })
  }, [data])

  const totalItems = data?.totalItems || 0
  const totalPages = data?.totalPages || 0

  console.log(data, nfts)

  return (
    <>
      <NFTs
        nfts={nfts}
        isLoading={isLoading || isValidating}
        searchTokens={searchTokens}
        links={ProfileConstants}
        totalItems={totalItems}
        currentPage={currentPage}
      />
      <Button
        disabled={isLoading}
        className={clsx(
          "block mx-auto",
          (totalPages === currentPage || !nfts.length) && "hidden",
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
