import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import { useAtom } from "jotai"
import { useEffect, useMemo, useState } from "react"

import { Copy } from "../../atoms/copy"
import { DropdownSelect } from "../../atoms/dropdown-select"
import { QRCode } from "../../atoms/qrcode"
import { transferModalAtom } from "./state"
import { IWallet } from "./types"

interface ITransferModalReceive {
  wallets: IWallet[] | undefined
  walletOptions: { label: string; value: string }[]
}

export const TransferModalReceive: React.FC<ITransferModalReceive> = ({
  walletOptions,
  wallets,
}) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  useEffect(() => {
    if (wallets?.length && !transferModalState.selectedWallets.length) {
      setTransferModalState({
        ...transferModalState,
        selectedWallets: [wallets[0].principal?.toText() ?? ""],
      })
    }
  }, [setTransferModalState, transferModalState, wallets])

  const selectedWalletAddress = useMemo(() => {
    const wallet = wallets?.find(
      (wallet) =>
        wallet.principal?.toText() === transferModalState.selectedWallets[0] ||
        wallet.address === transferModalState.selectedWallets[0],
    )

    if (wallet?.isVaultWallet) return wallet.address ?? ""

    return transferModalState.selectedWallets.length
      ? principalToAddress(
          Principal.fromText(transferModalState.selectedWallets[0]),
        )
      : ""
  }, [transferModalState.selectedWallets, wallets])

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-col space-y-2.5 text-black-base">
        <DropdownSelect
          label="Select your wallet"
          options={walletOptions ?? []}
          selectedValues={transferModalState.selectedWallets}
          setSelectedValues={(value) =>
            setTransferModalState({
              ...transferModalState,
              selectedWallets: value,
            })
          }
          isSearch
          isMultiselect={false}
        />

        <div>
          <p className="mb-1 text-xs text-gray-400">Account ID</p>
          <div
            className={clsx(
              "h-[40px] text-gray-400 bg-gray-100 rounded-md",
              "flex items-center justify-between px-2.5 space-x-2",
            )}
            id="account-id"
          >
            <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {selectedWalletAddress}
            </p>
            <Copy
              className="w-[18px] h-[18px] flex-shrink-0"
              value={selectedWalletAddress}
            />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-400">Principal ID</p>
          <div
            className={clsx(
              "h-[40px] text-gray-400 bg-gray-100 rounded-md",
              "flex items-center justify-between px-2.5 space-x-2",
            )}
            id="principal-id"
          >
            <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {transferModalState.selectedWallets[0]}
            </p>
            <Copy
              className="w-[18px] h-[18px] flex-shrink-0"
              value={transferModalState.selectedWallets[0]}
            />
          </div>
        </div>
      </div>
      <div className="w-[179px] my-8 mx-auto">
        <QRCode
          options={{ width: 179, margin: 0 }}
          content={
            transferModalState.selectedWallets.length
              ? transferModalState.selectedWallets[0]
              : ""
          }
        />
      </div>
    </div>
  )
}
