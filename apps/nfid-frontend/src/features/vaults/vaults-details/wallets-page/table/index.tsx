import React, { useCallback, useMemo, useState } from "react"

import { Table } from "@nfid-frontend/ui"
import { ObjectState, Wallet } from "@nfid/integration"

import { toUSD } from "frontend/features/fungible-token/accumulate-app-account-balances"
import { useICPExchangeRate } from "frontend/features/fungible-token/icp/hooks/use-icp-exchange-rate"
import { useVault } from "frontend/features/vaults/hooks/use-vault"
import { e8sICPToString } from "frontend/integration/wallet/utils"

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
  const { exchangeRate } = useICPExchangeRate()
  const { isAdmin } = useVault()

  const walletsToRows = useMemo(() => {
    if (!exchangeRate) return []

    return wallets.map(
      (wallet, index) =>
        ({
          id: index,
          uid: wallet.uid,
          address: wallet.address,
          name: wallet.name,
          number: index + 1,
          tokenBalance: e8sICPToString(Number(wallet.balance?.ICP)),
          USDBalance: toUSD(
            Number(e8sICPToString(Number(wallet.balance?.ICP))),
            exchangeRate,
          ),
          isArchived: wallet.state === ObjectState.ARCHIVED,
          isAdmin: isAdmin,
        } as VaultsWalletsTableRowProps),
    )
  }, [exchangeRate, isAdmin, wallets])

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
