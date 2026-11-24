import { ListNFTUi } from "packages/ui/src/organisms/send-receive/components/list-nft"
import { useCallback, useEffect, useMemo, useState } from "react"
import BigNumber from "bignumber.js"

import { useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { mutate } from "swr"

import { fetchNFTs } from "frontend/features/collectibles/utils/util"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { NFT } from "frontend/integration/nft/nft"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

import { FormValues, SendStatus } from "../types"
import { FormProvider, useForm } from "react-hook-form"
import { marketplaceService } from "@nfid/integration/marketplace"
import { E8S, ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { fetchSellerListings } from "frontend/features/marketplace/utils"
import { icrc7Source } from "frontend/integration/nft/sources/icrc7-source"

const DEFAULT_EARN_ERROR = "Something went wrong. Please try again later."

interface ListNFTProps {
  preselectedListing?: { id: bigint; collectionId: string }
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const ListNFT = ({
  preselectedListing,
  onClose,
  setErrorMessage,
  setSuccessMessage,
}: ListNFTProps) => {
  const [selectedNFT, setSelectedNFT] = useState<NFT | undefined>(undefined)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const { identity } = useIdentity()

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
    },
  })

  const { data: marketplaceConfig, isLoading: isMarketplaceConfigLoading } =
    useSWR("marketplace-config", () => marketplaceService.getConfig(), {
      revalidateOnFocus: false,
    })

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })
  const { initedTokens } = useTokensInit(tokens)

  const icpToken = useMemo(() => {
    if (!initedTokens) return undefined
    return initedTokens.find(
      (token) => token.getTokenAddress() === ICP_CANISTER_ID,
    )
  }, [initedTokens])

  const { data: nfts, isLoading: isNftListLoading } = useSWR(
    "nftList",
    () => fetchNFTs(),
    { revalidateOnFocus: false },
  )

  const { data: sellerListings = [] } = useSWR(
    "user-listings",
    () => fetchSellerListings(),
    { revalidateOnFocus: false },
  )

  const listedNftKeys = useMemo(
    () => new Set(sellerListings.map((l) => `${l.collectionId}:${l.tokenId}`)),
    [sellerListings],
  )

  const icrc7Nfts = useMemo(() => {
    if (!nfts) return
    return nfts.items.filter((nft) => nft.getNftStandard() === "ICRC-7")
  }, [nfts])

  useEffect(() => {
    if (!preselectedListing || !nfts) return
    const tokenIdStr = preselectedListing.id.toString()
    const nft = nfts.items.find(
      (n) =>
        n.getTokenId() === tokenIdStr &&
        (!preselectedListing.collectionId ||
          n.getCollectionId() === preselectedListing.collectionId),
    )
    if (nft) setSelectedNFT(nft)
  }, [preselectedListing, nfts])

  const submit = useCallback(
    async (values: { amount: string }) => {
      if (!identity || !selectedNFT) return
      setIsSuccessOpen(true)

      marketplaceService
        .listNft(identity, {
          collectionId: selectedNFT.getCollectionId(),
          tokenId: BigInt(selectedNFT.getTokenId()),
          priceE8s: BigInt(
            new BigNumber(values.amount).multipliedBy(E8S).toFixed(0),
          ),
        })
        .then(async () => {
          await icrc7Source.invalidateFloorPrice(selectedNFT.getCollectionId())
          mutate("user-listings")
          mutate((key) => Array.isArray(key) && key[0] === "listings")
          mutate((key) => Array.isArray(key) && key[0] === "listing")
          setSuccessMessage(`NFT listed successful`)
          setStatus(SendStatus.COMPLETED)
        })
        .catch((e) => {
          console.error(
            `List NFT error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          setErrorMessage("Something went wrong")
          setStatus(SendStatus.FAILED)
          setError(DEFAULT_EARN_ERROR)
        })

      return
    },
    [selectedNFT, setErrorMessage, setSuccessMessage, identity],
  )

  return (
    <FormProvider {...formMethods}>
      <ListNFTUi
        isLoading={isNftListLoading || isMarketplaceConfigLoading}
        loadingMessage={"Loading NFT..."}
        nfts={icrc7Nfts}
        onSelectNFT={setSelectedNFT}
        selectedNFT={selectedNFT}
        submit={submit}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        status={status}
        token={icpToken}
        minPrice={Number(marketplaceConfig?.minPriceE8s) / E8S}
        error={error}
        listedNftKeys={listedNftKeys}
      />
    </FormProvider>
  )
}
