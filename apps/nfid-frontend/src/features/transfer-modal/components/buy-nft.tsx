import { BuyNFTUi } from "packages/ui/src/organisms/send-receive/components/buy-nft"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { SendStatus } from "../types"
import {
  fetchBuyQuote,
  fetchListingById,
} from "frontend/features/marketplace/utils"
import { marketplaceService } from "@nfid/integration/marketplace"
import { mutate } from "@nfid/swr"
import { icrc7Source } from "frontend/integration/nft/sources/icrc7-source"

interface BuyNFTProps {
  preselectedListing: bigint | undefined
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

const DEFAULT_EARN_ERROR = "Something went wrong. Please try again later."

export const BuyNFT = ({
  preselectedListing,
  onClose,
  setErrorMessage,
  setSuccessMessage,
}: BuyNFTProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const { identity } = useIdentity()

  const { data: listing, isLoading: isListingsLoading } = useSWR(
    preselectedListing !== undefined
      ? ["listing", preselectedListing.toString()]
      : null,
    ([, id]: [string, string]) => fetchListingById(BigInt(id)),
    { revalidateOnFocus: false },
  )

  const { data: buyQuote, isLoading: isQuoteLoading } = useSWR(
    listing ? ["buyQuote", listing.id] : null,
    () => fetchBuyQuote(listing!.id),
    { revalidateOnFocus: false },
  )

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const { initedTokens } = useTokensInit(tokens)

  const icpToken = useMemo(() => {
    if (!initedTokens) return undefined
    return initedTokens.find(
      (token: FT) => token.getTokenAddress() === ICP_CANISTER_ID,
    )
  }, [initedTokens])

  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    return () => {
      if (statusRef.current === SendStatus.COMPLETED) {
        mutate("user-listings")
        mutate((key) => Array.isArray(key) && key[0] === "listings")
        mutate((key) => Array.isArray(key) && key[0] === "listing")
        mutate("nftList")
      }
    }
  }, [])

  const submit = useCallback(async () => {
    if (!identity || !listing) return

    setIsSuccessOpen(true)
    marketplaceService
      .buy(identity, listing.id)
      .then(async () => {
        await icrc7Source.invalidateFloorPrice(listing.collectionId)
        setSuccessMessage(`NFT purchased successfully`)
        setStatus(SendStatus.COMPLETED)
      })
      .catch((error) => {
        console.error(
          `Buy NFT error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_EARN_ERROR)
        setStatus(SendStatus.FAILED)
        setError(DEFAULT_EARN_ERROR)
      })
  }, [identity, setErrorMessage, setSuccessMessage, listing])

  return (
    <>
      <BuyNFTUi
        listing={listing}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        error={error}
        isLoading={isListingsLoading || isQuoteLoading}
        icpToken={icpToken}
        onBuy={submit}
        status={status}
        buyQuote={buyQuote}
      />
    </>
  )
}
