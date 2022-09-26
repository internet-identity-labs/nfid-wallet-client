import { decodeTokenIdentifier } from "ictool"
import React from "react"
import { useLocation, useParams } from "react-router-dom"
import useSWR from "swr"

import { getTokenTxHistoryOfTokenIndex } from "frontend/integration/cap"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Loader } from "frontend/ui/atoms/loader"
import { ProfileNFTDetailsPage } from "frontend/ui/pages/new-profile/nft-details"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { useNFT } from "../assets/hooks"
import { mapTransactionsForUI } from "./utils"

const ProfileNFTDetails = () => {
  const location = useLocation()
  const { tokenId } = useParams()

  const nft = React.useMemo(() => {
    return (location.state as any)?.nft as UserNFTDetails
  }, [location.state])

  const { data: nftDetails } = useNFT(tokenId ?? "")

  const {
    data,
    isValidating: isTransactionsFetching,
    mutate: refetchTransactions,
  } = useSWR(
    nft
      ? `transactions_${nft?.tokenId}`
      : `transactions_${nftDetails?.tokenId}`,
    () =>
      getTokenTxHistoryOfTokenIndex(
        nft?.canisterId ?? nftDetails?.canisterId,
        decodeTokenIdentifier(tokenId as string).index,
        0,
        100,
      ),
  )

  React.useEffect(() => {
    refetchTransactions()
  }, [nftDetails, refetchTransactions])

  const transactions = React.useMemo(() => {
    if (!data?.txHistory) return []

    const transactionsSortedByDate = data.txHistory.sort(
      (a, b) => Number(b.time) - Number(a.time),
    )

    return mapTransactionsForUI(transactionsSortedByDate)
  }, [data])

  if (!nft && !nftDetails)
    return (
      <ProfileTemplate pageTitle="Fetching NFT...">
        <Loader isLoading={true} />
      </ProfileTemplate>
    )

  return (
    <ProfileNFTDetailsPage
      nft={nft ?? nftDetails}
      isTransactionsFetching={isTransactionsFetching}
      transactions={transactions}
    />
  )
}

export default ProfileNFTDetails
