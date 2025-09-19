import { useActor } from "@xstate/react"
import clsx from "clsx"
import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import { NFTs } from "packages/ui/src/organisms/nfts"
import { Balance } from "packages/ui/src/organisms/profile-info/balance"
import { useCallback, useContext, useState, useEffect, useMemo } from "react"

import { Button, Skeleton } from "@nfid-frontend/ui"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { NFT } from "frontend/integration/nft/nft"
import { nftService } from "frontend/integration/nft/nft-service"
import { ProfileContext } from "frontend/provider"

import { useCachedTokens } from "../fungible-token/use-cached-tokens"
import { tokenManager } from "../fungible-token/token-manager"
import { ModalType } from "../transfer-modal/types"
import { fetchNFTs } from "./utils/util"

const DEFAULT_LIMIT_PER_PAGE = 8

const NFTsPage = () => {
  const globalServices = useContext(ProfileContext)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [, send] = useActor(globalServices.transferService)

  const { data: allNfts, isLoading: isAllNFTsLoading } = useSWR(
    "nftList",
    () => fetchNFTs(),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const { data, isLoading, isValidating } = useSWR(
    ["nftList", currentPage],
    () => fetchNFTs(currentPage, DEFAULT_LIMIT_PER_PAGE),
    { revalidateOnFocus: false, revalidateIfStale: false },
  )

  const { tokens = [] } = useCachedTokens()

  const icp = useMemo(() => {
    return tokens.find((token) => token.getTokenAddress() === ICP_CANISTER_ID)
  }, [tokens])

  const {
    data: nftTotalPrice,
    isLoading: nftTotalPriceLoading,
    mutate,
  } = useSWR(
    icp && allNfts?.items ? "nftTotalPrice" : null,
    async () => {
      if (!icp || !allNfts?.items) return undefined
      const initializedIcp = await tokenManager.initializeToken(icp)
      return nftService.getNFTsTotalPrice(allNfts.items, initializedIcp)
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  )

  useEffect(() => {
    mutate()
  }, [nfts, mutate])

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

  const totalItems = useMemo(() => data?.totalItems || 0, [data])
  const totalPages = useMemo(() => data?.totalPages || 0, [data])

  return (
    <>
      <div className="p-[20px] md:p-[30px] border-gray-200 dark:border-zinc-700 border rounded-[24px] mb-[20px] md:mb-[30px] flex flex-col md:flex-row">
        <div className="flex flex-col flex-1 md:mr-[60px]">
          <p className="mb-[16px] text-sm font-bold text-gray-400 dark:text-zinc-500">
            NFT balance
          </p>
          <Balance
            id={"totalBalance"}
            isLoading={nftTotalPriceLoading || isAllNFTsLoading}
            className="text-[26px]"
            usdBalance={nftTotalPrice}
          />
        </div>
        <div className="flex mt-[20px] flex-1 md:my-[0]">
          <div className="flex flex-col mr-[60px]">
            <p className="mb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500">
              NFTs owned
            </p>
            <p
              id={"items-amount"}
              className="mb-0 text-[26px] font-bold dark:text-white"
            >
              {data === undefined ? (
                <Skeleton className="w-[80px] h-[20px] mt-[10px]" />
              ) : (
                data.totalItems
              )}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="mb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500">
              NFTs w/o price
            </p>
            <p className="mb-0 text-[26px] font-bold dark:text-white">
              {data === undefined ? (
                <Skeleton className="w-[80px] h-[20px] mt-[10px]" />
              ) : (
                (data?.nftsWithoutPrice ?? 0)
              )}
            </p>
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
      <ProfileContainer>
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
            (totalPages === currentPage || !nfts.length || isLoading) &&
              "hidden",
          )}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          type="ghost"
        >
          {isLoading ? "Loading..." : "Load more"}
        </Button>
      </ProfileContainer>
    </>
  )
}

export default NFTsPage
