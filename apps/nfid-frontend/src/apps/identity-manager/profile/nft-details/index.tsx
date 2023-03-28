import { TransactionPrettified } from "@psychedelic/cap-js"
import React, { useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { getTokenTxHistoryOfTokenIndex } from "frontend/integration/cap/fungible-transactions"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { Loader } from "frontend/ui/atoms/loader"
import { ProfileNFTDetailsPage } from "frontend/ui/pages/new-profile/nft-details"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { mapTransactionsForUI } from "./utils"

const ACTIVITY_TARGET = 5

const ProfileNFTDetails = () => {
  const location = useLocation()
  const state = location.state as { nft?: UserNonFungibleToken }
  const { tokenId } = useParams()

  const [NFTActivity, setNFTActivity] = useState<TransactionPrettified[]>([])
  const applications = useApplicationsMeta()

  const [isActivityFetching, setIsActivityFetching] = useState<boolean>(true)

  const nft = React.useMemo(() => {
    return state?.nft
  }, [state?.nft])

  const fetchTokenHistory = React.useCallback(
    async (i: number) => {
      if (!nft?.contractId || !tokenId) return
      let result

      try {
        result = await getTokenTxHistoryOfTokenIndex(
          nft.contractId,
          tokenId,
          i * 10 - 10,
          i * 10,
        )
        console.debug(`fetchTokenHistory_${i}`, { result, NFTActivity })
      } catch (e) {
        console.error("fetchTokenHistory", e)
      }

      if (!result) {
        setIsActivityFetching(false)
        return
      }

      setNFTActivity(NFTActivity.concat(result.txHistory))

      if (!result.isLastPage && NFTActivity.length < ACTIVITY_TARGET)
        fetchTokenHistory(i + 1)
      else setIsActivityFetching(false)
    },
    [NFTActivity, nft?.contractId, tokenId],
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
      isTransactionsFetching={isActivityFetching}
      transactions={transactions}
      applications={applications.applicationsMeta || []}
    />
  )
}

export default ProfileNFTDetails
