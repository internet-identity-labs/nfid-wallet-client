import React, { useCallback, useMemo, useState } from "react"

import { Table } from "@nfid-frontend/ui"
import { ObjectState, Wallet } from "@nfid/integration"

import { VaultArchiveWallet } from "../modal-archive-wallet"
import { VaultsWalletsTableHeader } from "./table-header"
import { VaultsWalletsTableRow, VaultsWalletsTableRowProps } from "./table-row"

export interface VaultsWalletsTableProps {
  wallets: Wallet[]
}

export const VaultsWalletsTable: React.FC<VaultsWalletsTableProps> = ({
  wallets,
}) => {
  const [isArchiveModal, setIsArchiveModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet>()

  const walletsToRows = useMemo(() => {
    return wallets.map(
      (wallet, index) =>
        ({
          id: index,
          uid: wallet.uid,
          name: wallet.name,
          number: index + 1,
          tokenBalance: 0,
          USDBalance: 0,
          isArchived: wallet.state === ObjectState.ARCHIVED,
        } as VaultsWalletsTableRowProps),
    )
  }, [wallets])

  const onModalOpen = useCallback(
    (type: "archive", walletUid: string) => {
      const wallet = wallets.find((wallet) => wallet.uid === walletUid)
      setSelectedWallet(wallet)

      if (type === "archive") setIsArchiveModal(true)
    },
    [wallets],
  )

  return (
    <Table tableHeader={<VaultsWalletsTableHeader />}>
      {walletsToRows.map((wallet) => (
        <VaultsWalletsTableRow
          {...wallet}
          key={`wallet_${wallet.uid}`}
          onArchive={() => onModalOpen("archive", wallet.uid ?? "")}
          isArchived={wallet.isArchived}
        />
      ))}
      <VaultArchiveWallet
        selectedWallet={selectedWallet}
        isModalOpen={isArchiveModal}
        setIsModalOpen={setIsArchiveModal}
      />
    </Table>
  )
}
