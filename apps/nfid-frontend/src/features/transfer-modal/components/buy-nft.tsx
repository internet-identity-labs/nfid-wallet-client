import { BuyNFTUi } from "packages/ui/src/organisms/send-receive/components/buy-nft"
import { useCallback, useMemo, useState } from "react"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { SendStatus } from "../types"
import {
  fetchBuyQuote,
  fetchListings,
} from "frontend/features/marketplace/utils"
import { marketplaceService } from "@nfid/integration/marketplace"
import { mutate } from "@nfid/swr"

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

  const { data: listings = [], isLoading: isListingsLoading } = useSWR(
    "listings",
    () => fetchListings(),
    { revalidateOnFocus: false },
  )

  const listing = useMemo(() => {
    return listings.find((l) => l.id === preselectedListing)
  }, [listings])

  const { data: buyQuote, isLoading: isQuoteLoading } = useSWR(
    listing ? ["buyQuote", listing.id] : null,
    () => fetchBuyQuote(listing!.id),
    { revalidateOnFocus: false },
  )

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  console.log(buyQuote)

  const { initedTokens } = useTokensInit(tokens)

  const icpToken = useMemo(() => {
    if (!initedTokens) return undefined
    return initedTokens.find(
      (token: FT) => token.getTokenAddress() === ICP_CANISTER_ID,
    )
  }, [initedTokens])

  const handleClose = useCallback(() => {
    if (status === SendStatus.COMPLETED) {
      mutate("user-listings")
      mutate("listings")
      mutate("nftList")
    }
    onClose()
  }, [onClose, status])

  const submit = useCallback(async () => {
    if (!identity || !listing) return

    setIsSuccessOpen(true)

    marketplaceService
      .buy(identity, listing.id)
      .then(() => {
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
  }, [identity, setErrorMessage, setSuccessMessage])

  return (
    <>
      <BuyNFTUi
        listing={listing}
        isSuccessOpen={isSuccessOpen}
        onClose={handleClose}
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
