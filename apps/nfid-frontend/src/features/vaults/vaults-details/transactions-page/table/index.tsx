import { Principal } from "@dfinity/principal"
import { format } from "date-fns"
import { fromHexString, principalToAddress } from "ictool"
import React, { useMemo } from "react"
import useSWR from "swr"

import { Table } from "@nfid-frontend/ui"
import { bigIntMillisecondsToSeconds } from "@nfid-frontend/utils"
import { Transaction } from "@nfid/integration"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { useICPExchangeRate } from "frontend/features/fungable-token/icp/hooks/use-icp-exchange-rate"
import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { useVaultWallets } from "frontend/features/vaults/hooks/use-vault-wallets"
import { getMemberAddress } from "frontend/features/vaults/services"
import { e8sICPToString } from "frontend/integration/wallet/utils"

import { VaultsTransactionsTableHeader } from "./table-header"
import {
  IVaultTransactionsDetails,
  VaultsTransactionsTableRow,
} from "./table-row"

declare const VAULT_CANISTER_ID: string
export interface VaultsTransactionsTableProps {
  transactions: Transaction[]
}

export const VaultsTransactionsTable: React.FC<
  VaultsTransactionsTableProps
> = ({ transactions }) => {
  const { vault } = useVault()
  const { wallets } = useVaultWallets()
  const { exchangeRate } = useICPExchangeRate()
  const { data: userAddress } = useSWR("vaultMemberAddress", getMemberAddress)

  const transactionsToRows = useMemo(() => {
    console.log({ transactions })
    return transactions.map(
      (transaction, index) =>
        ({
          number: index + 1,
          fromWalletName:
            wallets?.find(
              (wallet) => wallet.uid === transaction.from_sub_account,
            )?.name ?? "",
          toAddress: transaction.to,
          ownerName: transaction.owner,
          id: transaction.id,
          status: transaction.state,
          amountICP: e8sICPToString(Number(transaction.amount)),
          amountUSD: toUSD(
            Number(e8sICPToString(Number(transaction.amount))),
            exchangeRate ?? 0,
          ),
          fromAddress: principalToAddress(
            Principal.fromText(VAULT_CANISTER_ID),
            fromHexString(transaction.from_sub_account),
          ),
          createdDate: format(
            new Date(bigIntMillisecondsToSeconds(transaction.createdDate)),
            "MMM dd, yyyy - hh:mm:ss aaa",
          ),
          approvers: vault?.members
            .map((member) => ({
              name: member.name,
              isApproved:
                transaction.approves.findIndex(
                  (approver) => approver.signer === member.userId,
                ) !== -1,
            }))
            .sort((a, b) => Number(b.isApproved) - Number(a.isApproved)),
          memberThreshold: transaction.memberThreshold,
          isInitiatedByYou: transaction.owner === userAddress,
          isApprovedByYou:
            transaction.approves.findIndex(
              (approve) => approve.signer === userAddress,
            ) !== -1,
          memo: transaction.memo,
        } as IVaultTransactionsDetails),
    )
  }, [exchangeRate, transactions, userAddress, vault?.members, wallets])

  return (
    <Table tableHeader={<VaultsTransactionsTableHeader />}>
      {transactionsToRows.map((transaction) => (
        <VaultsTransactionsTableRow
          {...transaction}
          key={`transaction_${transaction.id}`}
        />
      ))}
    </Table>
  )
}
