import React, { useMemo } from "react"

import { ObjectState, Policy } from "@nfid/integration"
import { Table } from "@nfid/ui"

import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { e8sICPToString } from "frontend/integration/wallet/utils"

import { VaultsPoliciesTableHeader } from "./table-header"
import {
  VaultsPoliciesTableRow,
  VaultsPoliciesTableRowProps,
} from "./table-row"

export interface VaultsPoliciesTableProps {
  policies: Policy[]
}

export const VaultsPoliciesTable: React.FC<VaultsPoliciesTableProps> = ({
  policies,
}) => {
  const { vault, isAdmin } = useVault()

  const policiesToRows = useMemo(() => {
    return policies.map(
      (policy, index) =>
        ({
          id: policy.id,
          number: index + 1,
          // @ts-ignore
          source: policy.walletName,
          greaterThan: `${e8sICPToString(Number(policy.amountThreshold))} ${
            policy.currency
          }`,
          approvers: policy.memberThreshold
            ? `${policy.memberThreshold} of ${vault?.members.length}`
            : "All",
          isArchived: policy.state === ObjectState.ARCHIVED,
          isAdmin,
        }) as VaultsPoliciesTableRowProps,
    )
  }, [isAdmin, policies, vault?.members.length])

  return (
    <Table tableHeader={<VaultsPoliciesTableHeader />}>
      {policiesToRows.map((policy) => (
        <VaultsPoliciesTableRow
          {...policy}
          key={`policy_${policy.id}`}
          isArchived={policy.isArchived}
        />
      ))}
    </Table>
  )
}
