import React, { useMemo } from "react"

import { ObjectState, Wallet } from "@nfid/integration"
import { Table } from "@nfid/ui"
import { toUSD } from "@nfid/utils"

import { useICPExchangeRate } from "frontend/features/fungible-token/icp/hooks/use-icp-exchange-rate"
import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { e8sICPToString } from "frontend/integration/wallet/utils"

import { VaultsWalletsTableHeader } from "./table-header"
import { VaultsWalletsTableRow, VaultsWalletsTableRowProps } from "./table-row"

export interface VaultsWalletsTableProps {
  wallets: Wallet[]
}

export const VaultsWalletsTable: React.FC<VaultsWalletsTableProps> = ({
  wallets,
}) => {
  const { exchangeRate } = useICPExchangeRate()
  const { isAdmin } = useVault()

  const walletsToRows = useMemo(() => {
    if (!exchangeRate) return []

    return wallets.map(
      (wallet, index) =>
        ({
          id: index,
          uid: wallet.uid,
          address: wallet.address,
          name: wallet.name,
          number: index + 1,
          tokenBalance: e8sICPToString(Number(wallet.balance?.ICP)),
          USDBalance: toUSD(
            Number(e8sICPToString(Number(wallet.balance?.ICP))),
            exchangeRate,
          ),
          isArchived: wallet.state === ObjectState.ARCHIVED,
          isAdmin,
        }) as VaultsWalletsTableRowProps,
    )
  }, [exchangeRate, isAdmin, wallets])

  return (
    <Table tableHeader={<VaultsWalletsTableHeader />}>
      {walletsToRows.map((wallet) => (
        <VaultsWalletsTableRow
          {...wallet}
          key={`wallet_${wallet.uid}`}
          isArchived={wallet.isArchived}
        />
      ))}
    </Table>
  )
}
