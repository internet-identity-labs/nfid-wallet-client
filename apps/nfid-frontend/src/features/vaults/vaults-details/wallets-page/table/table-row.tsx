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

import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"

export interface VaultsWalletsTableRowProps {
  address?: string
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
  address,
  number,
  name,
  tokenBalance,
  USDBalance,
  onArchive,
  isArchived,
  isAdmin,
}: VaultsWalletsTableRowProps) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)
  const { wallets } = useAllWallets()

  const onSendFromVaultWallet = useCallback(() => {
    setTransferModalState({
      ...transferModalState,
      isModalOpen: true,
      sendType: "ft",
      selectedWallets: address ? [address] : [],
      selectedWallet: wallets.find((w) => w.address === address) ?? ({} as any),
    })
  }, [address, setTransferModalState, transferModalState, wallets])

  const onReceiveToVaultWallet = useCallback(() => {
    setTransferModalState({
      ...transferModalState,
      isModalOpen: true,
      modalType: "Receive",
      selectedWallets: address ? [address] : [],
    })
  }, [setTransferModalState, transferModalState, address])

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
            <IconCmpDots className={clsx("w-full", isArchived && "hidden")} />
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
                onClick: onReceiveToVaultWallet,
              },
              isAdmin
                ? {
                    icon: <IconCmpArchive />,
                    text: "Archive",
                    onClick: onArchive,
                  }
                : {},
            ]}
          />
        </Popover>
      </TableCell>
    </TableRow>
  )
}
