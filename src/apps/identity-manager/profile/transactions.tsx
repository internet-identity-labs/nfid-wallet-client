import { format } from "date-fns"
import { useMemo } from "react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import ProfileTransactionsPage from "frontend/ui/pages/new-profile/transaction-history"

import { useWallet } from "./wallet/hooks"

interface ITransaction {
  type: "send" | "receive"
  date: string
  asset: string
  quantity: number
  from: string
  to: string
  note?: string
}

const ProfileTransactions = () => {
  const { walletTransactions, walletAddress, isWalletLoading } = useWallet()

  const transactions: ITransaction[] | undefined = useMemo(() => {
    return walletTransactions?.transactions.map(({ transaction }) => {
      const isSend = transaction.operations[0].account.address === walletAddress

      return {
        type: isSend ? "send" : "receive",
        asset: transaction.operations[0].amount.currency.symbol,
        quantity: Math.abs(Number(transaction.operations[0].amount.value)),
        date: format(
          new Date(transaction.metadata.timestamp / 1000000),
          "MMM dd, yyyy - hh:mm:ss aaa",
        ),
        from: transaction.operations[0].account.address,
        to: transaction.operations[1].account.address,
      }
    })
  }, [walletAddress, walletTransactions?.transactions])

  return (
    <>
      <Loader isLoading={isWalletLoading} />
      <ProfileTransactionsPage
        sentData={transactions?.filter((t) => t.type === "send") ?? []}
        receivedData={transactions?.filter((t) => t.type === "receive") ?? []}
      />
    </>
  )
}

export default ProfileTransactions
