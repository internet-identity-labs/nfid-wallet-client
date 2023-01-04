import { format } from "date-fns"
import React, { useMemo } from "react"

import { Table } from "@nfid-frontend/ui"
import { BigIntMillisecondsToSeconds } from "@nfid-frontend/utils"
import { Vault } from "@nfid/integration"

import { VaultsTableHeader } from "./table-header"
import { VaultsTableRow, VaultsTableRowProps } from "./table-row"

export interface VaultsTableProps {
  vaults: Vault[]
}

export const VaultsTable: React.FC<VaultsTableProps> = ({ vaults }) => {
  const vaultsToRowsOptions: VaultsTableRowProps[] = useMemo(() => {
    return vaults.map((vault) => ({
      id: String(vault.id),
      name: vault.name,
      walletsQuantity: vault.wallets.length,
      membersQuantity: vault.members.length,
      lastActivity: format(
        new Date(BigIntMillisecondsToSeconds(vault.modifiedDate)),
        "MMM dd, yyyy - hh:mm:ss aaa",
      ),
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
