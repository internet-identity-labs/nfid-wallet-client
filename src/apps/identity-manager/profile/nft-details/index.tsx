import { format } from "date-fns"
import { decodeTokenIdentifier } from "ictool"
import React from "react"
import { useLocation, useParams } from "react-router-dom"
import useSWR from "swr"

import { getTokenTxHistoryOfTokenIndex } from "frontend/integration/cap"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Loader } from "frontend/ui/atoms/loader"
import {
  ITransaction,
  ProfileNFTDetailsPage,
} from "frontend/ui/pages/new-profile/nft-details"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { useNFT } from "../assets/hooks"

const ProfileNFTDetails = () => {
  const location = useLocation()
  const { tokenId } = useParams()
  const [transactions, setTransactions] = React.useState<ITransaction[]>([])

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

  React.useEffect(() => {
    if (!data?.txHistory) return

    const formattedTransactions = data.txHistory
      .sort((a, b) => Number(b.time) - Number(a.time))
      .map((transaction) => {
        const details = transaction.details
        return {
          type: transaction.operation,
          datetime: format(
            new Date(Number(transaction.time)),
            "MMM dd, yyyy - hh:mm:ss aaa",
          ),
          from: transaction.from || "",
          to: transaction.to || "",
          price:
            details?.price && details?.price_currency && details?.price_decimals
              ? `${
                  Number(details.price) / 10 ** Number(details.price_decimals)
                } ${details.price_currency}`
              : "",
        }
      })

    setTransactions(formattedTransactions)
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
