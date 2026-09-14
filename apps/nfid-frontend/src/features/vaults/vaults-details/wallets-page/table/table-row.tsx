import clsx from "clsx"
import React, { useCallback, useContext } from "react"

import {
  IconCmpDots,
  IconCmpTransfer,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
} from "@nfid-frontend/ui"

import { ModalType } from "frontend/features/transfer-modal/types"
import { useAllWallets } from "frontend/integration/wallet/hooks/use-all-wallets"
import { ProfileContext } from "frontend/provider"

export interface VaultsWalletsTableRowProps {
  address?: string
  uid?: string
  id: number
  number: number
  name: string
  tokenBalance: string
  USDBalance: string
  isArchived?: boolean
}

export const VaultsWalletsTableRow: React.FC<VaultsWalletsTableRowProps> = ({
  address,
  number,
  name,
  tokenBalance,
  USDBalance,
  isArchived,
}: VaultsWalletsTableRowProps) => {
  const globalServices = useContext(ProfileContext)
  const { wallets } = useAllWallets()

  const onSendFromVaultWallet = useCallback(() => {
    const ts = globalServices.transferService
    ts.send({ type: "ASSIGN_SOURCE_WALLET", data: address ?? "" })
    ts.send({
      type: "ASSIGN_SOURCE_ACCOUNT",
      data: wallets.find((w) => w.address === address) ?? ({} as any),
    })
    ts.send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    ts.send({ type: "CHANGE_TOKEN_TYPE", data: "ft" })
    ts.send({ type: "ASSIGN_VAULTS", data: true })

    ts.send({ type: "SHOW" })
  }, [address, globalServices.transferService, wallets])

  return (
    <TableRow
      className={clsx(isArchived && "text-secondary pointer-events-none")}
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
            ]}
          />
        </Popover>
      </TableCell>
    </TableRow>
  )
}
