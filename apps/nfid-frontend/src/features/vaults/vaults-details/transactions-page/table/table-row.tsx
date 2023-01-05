import React, { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  Badge,
  IconCmpArrowRight,
  TableCell,
  TableRow,
} from "@nfid-frontend/ui"
import { TransactionState } from "@nfid/integration"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"

interface IApprover {
  name: string
  isApproved: boolean
}

export interface IVaultTransactionsDetails {
  number: number
  id: bigint
  fromWalletName: string
  fromAddress: string
  toAddress: string
  amountICP: string
  amountUSD: string
  ownerName: string
  createdDate: string
  memberThreshold: number
  approvers: IApprover[]
  status: TransactionState
  isInitiatedByYou: boolean
  isApprovedByYou: boolean
}

export enum VaultBadgeStatuses {
  APPROVED = "success",
  PENDING = "warning",
  CANCELED = "cancel",
  REJECTED = "error",
}

export const VaultsTransactionsTableRow: React.FC<IVaultTransactionsDetails> = (
  state,
) => {
  const navigate = useNavigate()

  const onDetailsOpen = useCallback(() => {
    navigate(
      `${ProfileConstants.base}/${ProfileConstants.vaults}/transactions/${state.id}`,
      {
        state,
      },
    )
  }, [navigate, state])

  return (
    <TableRow className="space-x-5 hover:bg-gray-100" onClick={onDetailsOpen}>
      <TableCell isLeft>{state.number}</TableCell>
      <TableCell>{state.ownerName}</TableCell>
      <TableCell>{state.fromWalletName}</TableCell>
      <TableCell>
        <CenterEllipsis
          value={state.toAddress}
          leadingChars={9}
          trailingChars={3}
        />
      </TableCell>
      <TableCell>
        <p>{state.amountICP?.toString()} ICP</p>
        <p className="text-xs text-gray-400">{state.amountUSD}</p>
      </TableCell>
      <TableCell>
        <Badge type={VaultBadgeStatuses[state.status]}>{state.status}</Badge>
      </TableCell>
      <TableCell isRight>
        <IconCmpArrowRight className="ml-auto text-gray-400" />
      </TableCell>
    </TableRow>
  )
}
