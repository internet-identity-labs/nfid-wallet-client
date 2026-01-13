import { useActor } from "@xstate/react"
import clsx from "clsx"
import React, { useCallback, useContext } from "react"

import {
  IconCmpDots,
  IconCmpTransfer,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
} from "@nfid/ui"

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
  const [, send] = useActor(globalServices.transferService)
  const { wallets } = useAllWallets()

  const onSendFromVaultWallet = useCallback(() => {
    send({ type: "ASSIGN_SOURCE_WALLET", data: address ?? "" })
    send({
      type: "ASSIGN_SOURCE_ACCOUNT",
      data: wallets.find((w) => w.address === address) ?? ({} as any),
    })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "CHANGE_TOKEN_TYPE", data: "ft" })
    send({ type: "ASSIGN_VAULTS", data: true })

    send({ type: "SHOW" })
  }, [address, send, wallets])

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
