import clsx from "clsx"
import { useAtom } from "jotai"
import React, { useCallback } from "react"

import {
  IconCmpArchive,
  IconCmpDots,
  IconCmpTransfer,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
  transferModalAtom,
} from "@nfid-frontend/ui"

export interface VaultsWalletsTableRowProps {
  uid?: string
  id: number
  number: number
  name: string
  tokenBalance: string
  USDBalance: string
  onArchive: () => void
  isArchived?: boolean
  isAdmin?: boolean
}

export const VaultsWalletsTableRow: React.FC<VaultsWalletsTableRowProps> = ({
  uid,
  number,
  name,
  tokenBalance,
  USDBalance,
  onArchive,
  isArchived,
  isAdmin,
}: VaultsWalletsTableRowProps) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  const onSendFromVaultWallet = useCallback(() => {
    setTransferModalState({
      ...transferModalState,
      isModalOpen: true,
      sendType: "ft",
    })
  }, [setTransferModalState, transferModalState])
  return (
    <TableRow
      className={clsx(isArchived && "text-gray-400 pointer-events-none")}
      id={`wallet_${name}`}
    >
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{tokenBalance} ICP</TableCell>
      <TableCell>{USDBalance}</TableCell>
      <TableCell isRight className="px-0">
        <Popover
          align="end"
          trigger={
            <IconCmpDots
              className={clsx("w-full", (isArchived || !isAdmin) && "hidden")}
            />
          }
        >
          <PopoverTools
            items={[
              {
                icon: <IconCmpTransfer />,
                text: "Send",
                onClick: onSendFromVaultWallet,
              },
              {
                icon: <IconCmpTransfer className="rotate-180" />,
                text: "Receive",
                onClick: () => [],
              },
              {
                icon: <IconCmpArchive />,
                text: "Archive",
                onClick: onArchive,
              },
            ]}
          />
        </Popover>
      </TableCell>
    </TableRow>
  )
}
