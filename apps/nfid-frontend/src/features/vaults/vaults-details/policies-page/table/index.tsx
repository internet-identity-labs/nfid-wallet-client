import React, { useCallback, useMemo, useState } from "react"

import { Table } from "@nfid-frontend/ui"
import { ObjectState, Policy } from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { e8sICPToString } from "frontend/integration/wallet/utils"

import { VaultArchivePolicy } from "../modal-archive-policy"
import { VaultEditPolicy } from "../modal-edit-policy"
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
  const [isArchiveModal, setIsArchiveModal] = useState(false)
  const [isEditModal, setIsEditModal] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy>()
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
          isAdmin: isAdmin,
        } as VaultsPoliciesTableRowProps),
    )
  }, [isAdmin, policies, vault?.members.length])

  const onModalOpen = useCallback(
    (type: "archive" | "edit", policyId: string) => {
      const policy = policies.find((policy) => policy.id === BigInt(policyId))
      setSelectedPolicy(policy)

      if (type === "archive") setIsArchiveModal(true)
      if (type === "edit") setIsEditModal(true)
    },
    [policies],
  )

  return (
    <Table tableHeader={<VaultsPoliciesTableHeader />}>
      {policiesToRows.map((policy) => (
        <VaultsPoliciesTableRow
          {...policy}
          key={`policy_${policy.id}`}
          onArchive={() => onModalOpen("archive", String(policy.id) ?? "")}
          onEdit={() => onModalOpen("edit", String(policy.id) ?? "")}
          isArchived={policy.isArchived}
        />
      ))}
      <VaultArchivePolicy
        selectedPolicy={selectedPolicy}
        isModalOpen={isArchiveModal}
        setIsModalOpen={setIsArchiveModal}
      />
      <VaultEditPolicy
        selectedPolicy={selectedPolicy}
        isModalOpen={isEditModal}
        setIsModalOpen={setIsEditModal}
      />
    </Table>
  )
}
