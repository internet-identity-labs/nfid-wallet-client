import { Principal } from "@dfinity/principal"

import { format } from "date-fns"
import React, { useMemo } from "react"

import { Transaction } from "@nfid/integration"
import { Table } from "@nfid/ui"
import { bigIntMillisecondsToSeconds, toUSD } from "@nfid/utils"

import { useICPExchangeRate } from "frontend/features/fungible-token/icp/hooks/use-icp-exchange-rate"
import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { useVaultMember } from "frontend/features/vaults/hooks/use-vault-member"
import { useVaultWallets } from "frontend/features/vaults/hooks/use-vault-wallets"
import { e8sICPToString } from "frontend/integration/wallet/utils"
import { getAddress } from "frontend/util/get-address"

import { VaultsTransactionsTableHeader } from "./table-header"
import {
  IVaultTransactionsDetails,
  VaultsTransactionsTableRow,
} from "./table-row"

export interface VaultsTransactionsTableProps {
  transactions: Transaction[]
}

export const VaultsTransactionsTable: React.FC<
  VaultsTransactionsTableProps
> = ({ transactions }) => {
  const { vault } = useVault()
  const { wallets } = useVaultWallets()
  const { exchangeRate } = useICPExchangeRate()
  const { address: userAddress } = useVaultMember()

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
          fromAddress: getAddress(
            Principal.fromText(VAULT_CANISTER_ID),
            transaction.from_sub_account,
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
          vaultId: vault?.id,
        }) as IVaultTransactionsDetails,
    )
  }, [
    exchangeRate,
    transactions,
    userAddress,
    vault?.id,
    vault?.members,
    wallets,
  ])

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
