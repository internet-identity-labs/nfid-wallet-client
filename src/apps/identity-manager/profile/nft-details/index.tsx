import { TransactionPrettified } from "@psychedelic/cap-js"
import React, { useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import { getTokenTxHistoryOfTokenIndex } from "frontend/integration/cap"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Loader } from "frontend/ui/atoms/loader"
import { ProfileNFTDetailsPage } from "frontend/ui/pages/new-profile/nft-details"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { useNFT } from "../assets/hooks"
import { mapTransactionsForUI } from "./utils"

const ACTIVITY_TARGET = 5

const ProfileNFTDetails = () => {
  const location = useLocation()
  const state = location.state as { nft?: UserNFTDetails }
  const { tokenId } = useParams()

  const { data: nftDetails } = useNFT(tokenId ?? "")
  const [NFTActivity, setNFTActivity] = useState<TransactionPrettified[]>([])
  const [isNFTActivityFetching, setIsNFTActivityFetching] =
    useState<boolean>(true)

  const nft = React.useMemo(() => {
    return state?.nft ?? nftDetails
  }, [nftDetails, state?.nft])

  const fetchTokenHistory = React.useCallback(
    async (i: number) => {
      if (!nft?.canisterId || !tokenId) return

      const result = await getTokenTxHistoryOfTokenIndex(
        nft.canisterId,
        tokenId,
        i * 10 - 10,
        i * 10,
      )

      console.debug(`fetchTokenHistory_${i}`, { result, NFTActivity })

      setNFTActivity(NFTActivity.concat(result.txHistory))

      if (!result.isLastPage && NFTActivity.length < ACTIVITY_TARGET)
        fetchTokenHistory(i + 1)
      else setIsNFTActivityFetching(false)
    },
    [NFTActivity, nft?.canisterId, tokenId],
  )

  React.useEffect(() => {
    fetchTokenHistory(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft])

  const transactions = React.useMemo(() => {
    const transactionsSortedByDate = NFTActivity.sort(
      (a, b) => Number(b.time) - Number(a.time),
    )

    return mapTransactionsForUI(transactionsSortedByDate)
  }, [NFTActivity])

  if (!nft)
    return (
      <ProfileTemplate pageTitle="Fetching NFT...">
        <Loader isLoading={true} />
      </ProfileTemplate>
    )

  return (
    <ProfileNFTDetailsPage
      nft={nft}
      isTransactionsFetching={isNFTActivityFetching}
      transactions={transactions}
    />
  )
}

export default ProfileNFTDetails
