import React, { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { TransactionState } from "@nfid/integration"
import {
  Badge,
  IconCmpArrowRight,
  TableCell,
  TableRow,
  Tooltip,
} from "@nfid/ui"
import { CenterEllipsis } from "@nfid/ui"
import toaster from "@nfid/ui/atoms/toast"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

interface IApprover {
  name: string
  isApproved: boolean
}

export interface IVaultTransactionsDetails {
  vaultId: bigint
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
  memo?: string
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
    navigate(`${ProfileConstants.vaults}/transactions/${state.id}`, {
      state,
    })
  }, [navigate, state])

  const copyToClipboard = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, value: string) => {
      e.stopPropagation()
      navigator.clipboard.writeText(value)
      toaster.success("Address copied to clipboard")
    },
    [],
  )

  return (
    <TableRow className="space-x-5 hover:bg-gray-100" onClick={onDetailsOpen}>
      <TableCell isLeft>{state.number}</TableCell>
      <TableCell>{state.ownerName}</TableCell>
      <TableCell
        className="hover:text-secondary"
        onClick={(e) => copyToClipboard(e, state.fromAddress)}
      >
        <Tooltip tip={"Copy to clipboard"}>
          <span>{state.fromWalletName}</span>
        </Tooltip>
      </TableCell>
      <TableCell
        className="hover:text-secondary"
        onClick={(e) => copyToClipboard(e, state.toAddress)}
      >
        <Tooltip tip={"Copy to clipboard"}>
          <CenterEllipsis
            value={state.toAddress}
            leadingChars={9}
            trailingChars={3}
          />
        </Tooltip>
      </TableCell>
      <TableCell>
        <p>{state.amountICP?.toString()} ICP</p>
        <p className="text-xs text-secondary">{state.amountUSD}</p>
      </TableCell>
      <TableCell>
        <Badge type={VaultBadgeStatuses[state.status]}>{state.status}</Badge>
      </TableCell>
      <TableCell isRight>
        <IconCmpArrowRight className="ml-auto text-secondary" />
      </TableCell>
    </TableRow>
  )
}
