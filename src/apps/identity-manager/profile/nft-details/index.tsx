import { format } from "date-fns"
import { decodeTokenIdentifier } from "ictool"
import React from "react"
import { useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import useSWR from "swr"

import { getTokenTxHistoryOfTokenIndex } from "frontend/integration/cap"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import {
  ITransaction,
  ProfileNFTDetailsPage,
} from "frontend/ui/pages/new-profile/nft-details"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { ProfileConstants } from "../routes"

interface IProfileNFTDetailsState {
  nft: UserNFTDetails
}

const ProfileNFTDetails = () => {
  const location = useLocation()
  const { nft } = location.state as IProfileNFTDetailsState
  const { navigate } = useNFIDNavigate()
  const [transactions, setTransactions] = React.useState<ITransaction[]>([])

  if (!nft) {
    toast.info("You can't open NFT by url, please open it from NFT list")
    // NFT TODO redirect to catalogue
    navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
  }

  const { data, isValidating: isTransactionsFetching } = useSWR(
    `transactions_${nft.canisterId}_${nft.index}`,
    () =>
      getTokenTxHistoryOfTokenIndex(
        nft.canisterId,
        decodeTokenIdentifier(nft.tokenId).index,
        0,
        100,
      ),
  )

  React.useEffect(() => {
    if (!data?.txHistory) return

    const formattedTransactions = data.txHistory
      .sort((a, b) => Number(b.time) - Number(a.time))
      .map((transaction) => ({
        type: transaction.operation,
        datetime: format(
          new Date(Number(transaction.time)),
          "MMM dd, yyyy - hh:mm:ss aaa",
        ),
        from: transaction.from || "",
        to: transaction.to || "",
        price:
          transaction.details?.price &&
          transaction.details?.price_currency &&
          transaction.details?.price_decimals
            ? `${
                Number(transaction.details.price) /
                10 ** Number(transaction.details.price_decimals)
              } ${transaction.details.price_currency}`
            : "",
      }))

    setTransactions(formattedTransactions)
  }, [data])

  return (
    <ProfileNFTDetailsPage
      nft={nft}
      isTransactionsFetching={isTransactionsFetching}
      transactions={transactions}
    />
  )
}

export default ProfileNFTDetails
