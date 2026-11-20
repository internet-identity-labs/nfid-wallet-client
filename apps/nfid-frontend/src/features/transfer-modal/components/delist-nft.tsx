import { DelistNFTUi } from "packages/ui/src/organisms/send-receive/components/delist-nft"
import { useCallback, useMemo } from "react"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { mutate } from "swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import {
  fetchBuyQuote,
  fetchSellerListings,
} from "frontend/features/marketplace/utils"
import { marketplaceService } from "@nfid/integration/marketplace"
import toaster from "packages/ui/src/atoms/toast"

interface DelistNFTProps {
  preselectedListing: bigint | undefined
  onClose: () => void
}

export const DelistNFT = ({ preselectedListing, onClose }: DelistNFTProps) => {
  const { identity } = useIdentity()
  const { data: listings = [], isLoading: isListingsLoading } = useSWR(
    "user-listings",
    () => fetchSellerListings(),
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

  const { initedTokens } = useTokensInit(tokens)

  const icpToken = useMemo(() => {
    if (!initedTokens) return undefined
    return initedTokens.find(
      (token: FT) => token.getTokenAddress() === ICP_CANISTER_ID,
    )
  }, [initedTokens])

  const submit = useCallback(async () => {
    if (!identity || !listing) return

    marketplaceService
      .cancelListing(identity, listing.id)
      .then(() => {
        mutate("listings")
        mutate("user-listings")
        mutate(["buyQuote", listing.id])
        toaster.success("NFT delisted successfully")
      })
      .catch((error) => {
        console.error(
          `Delist NFT error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        toaster.error("Something went wrong. Please try again later.")
      })
  }, [identity, listing])

  return (
    <>
      <DelistNFTUi
        listing={listing}
        onClose={onClose}
        isLoading={isListingsLoading || isQuoteLoading}
        icpToken={icpToken}
        onDelist={submit}
        buyQuote={buyQuote}
      />
    </>
  )
}
