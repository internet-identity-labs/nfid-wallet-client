import { useActor } from "@xstate/react"
import clsx from "clsx"
import React, { useCallback, useContext } from "react"

import {
  IconCmpArchive,
  IconCmpDots,
  IconCmpTransfer,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
} from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"

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
  const globalServices = useContext(ProfileContext)
  //REMOVE !!!!!!!!!!!!!!
  const allTokens = [] as any

  const [, send] = useActor(globalServices.transferService)
  const { wallets } = useAllWallets()

  const onSendFromVaultWallet = useCallback(() => {
    sendReceiveTracking.openModal({ isOpenedFromVaults: true })
    send({ type: "ASSIGN_SOURCE_WALLET", data: address ?? "" })
    send({
      type: "ASSIGN_SOURCE_ACCOUNT",
      data: wallets.find((w) => w.address === address) ?? ({} as any),
    })
    send({ type: "CHANGE_DIRECTION", data: "send" })
    send({ type: "CHANGE_TOKEN_TYPE", data: "ft" })
    send({ type: "ASSIGN_VAULTS", data: true })

    send({ type: "SHOW" })
  }, [address, send, wallets])

  const onReceiveToVaultWallet = useCallback(() => {
    sendReceiveTracking.openModal({
      isSending: false,
      isOpenedFromVaults: true,
    })

    send({ type: "ASSIGN_SELECTED_FT", data: allTokens[0] })
    send({ type: "ASSIGN_SOURCE_WALLET", data: address ?? "" })
    send({ type: "CHANGE_DIRECTION", data: "receive" })
    send({ type: "ASSIGN_VAULTS", data: true })

    send({ type: "SHOW" })
  }, [address, send, allTokens])

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
