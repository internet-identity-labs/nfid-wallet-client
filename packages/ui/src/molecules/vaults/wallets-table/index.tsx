import React, { useMemo } from "react"

import Table from "../../table"
import { VaultsWalletsTableHeader } from "./table-header"
import { VaultsWalletsTableRow, VaultsWalletsTableRowProps } from "./table-row"

export interface VaultsWalletsTableProps {
  wallets: any[]
}

export const VaultsWalletsTable: React.FC<VaultsWalletsTableProps> = ({
  wallets,
}) => {
  const walletsToRows = useMemo(() => {
    return wallets.map(
      (wallet, index) =>
        ({
          id: wallet.id,
          name: wallet.name,
          number: index,
          tokenBalance: 1.231,
          USDBalance: 2.51,
        } as VaultsWalletsTableRowProps),
    )
  }, [wallets])

  return (
    <Table tableHeader={<VaultsWalletsTableHeader />}>
      {walletsToRows.map((wallet) => (
        <VaultsWalletsTableRow {...wallet} key={`vault_${wallet.id}`} />
      ))}
    </Table>
  )
}
