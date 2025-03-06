import { useActor } from "@xstate/react"
import clsx from "clsx"
import { NFTs } from "packages/ui/src/organisms/nfts"
import { useCallback, useContext, useState, useEffect } from "react"

import { Button } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { NFT } from "frontend/integration/nft/nft"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"
import { fetchNFTs } from "./utils/util"

const DEFAULT_LIMIT_PER_PAGE = 8

const NFTsPage = () => {
  const globalServices = useContext(ProfileContext)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [, send] = useActor(globalServices.transferService)

  const { data, isLoading, isValidating } = useSWR(
    ["nftList", currentPage],
    () => fetchNFTs(currentPage, DEFAULT_LIMIT_PER_PAGE),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const onTransferNFT = useCallback(
    (nftId: string) => {
      send({ type: "ASSIGN_SELECTED_NFT", data: nftId })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })

      send("SHOW")
    },
    [send],
  )

  useEffect(() => {
    if (!data) return

    const { items } = data
    const newPlaceholders = Array(items.length).fill(null)

    setNfts((prevNfts) => [...prevNfts, ...newPlaceholders])

    Promise.all(
      items.map(async (nft: NFT, index: number) => {
        await nft.init()
        return { index, nft }
      }),
    ).then((resolvedNFTs) => {
      setNfts((prevNfts) => {
        const newNfts = [...prevNfts]

        resolvedNFTs.forEach(({ index, nft }: { index: number; nft: NFT }) => {
          newNfts[prevNfts.length - items.length + index] = nft
        })

        return newNfts
      })
    })
  }, [data])

  const totalItems = data?.totalItems || 0
  const totalPages = data?.totalPages || 0

  return (
    <>
      <NFTs
        nfts={nfts}
        isLoading={isLoading || isValidating}
        searchTokens={searchTokens}
        links={ProfileConstants}
        totalItems={totalItems}
        currentPage={currentPage}
        onTransferNFT={onTransferNFT}
      />
      <Button
        disabled={isLoading}
        className={clsx(
          "block mx-auto",
          (totalPages === currentPage || !nfts.length || isLoading) && "hidden",
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
