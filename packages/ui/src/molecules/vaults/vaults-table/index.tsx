import { format } from "date-fns"
import React, { useMemo } from "react"

import Table from "../../table"
import { VaultsTableHeader } from "./vaults-table-header"
import { VaultsTableRow, VaultsTableRowProps } from "./vaults-table-row"

export interface VaultsTableProps {
  vaults: any[]
}

export const VaultsTable: React.FC<VaultsTableProps> = ({ vaults }) => {
  const vaultsToRowsOptions: VaultsTableRowProps[] = useMemo(() => {
    return vaults.map((vault) => ({
      id: vault.id,
      name: vault.name,
      walletsQuantity: vault.wallets.length,
      membersQuantity: vault.members.length,
      lastActivity: format(vault.modifiedDate, "MMM dd, yyyy - hh:mm:ss aaa"),
    }))
  }, [vaults])

  return (
    <Table tableHeader={<VaultsTableHeader />}>
      {vaultsToRowsOptions.map((vault) => (
        <VaultsTableRow {...vault} key={`vault_${vault.id}`} />
      ))}
    </Table>
  )
}
