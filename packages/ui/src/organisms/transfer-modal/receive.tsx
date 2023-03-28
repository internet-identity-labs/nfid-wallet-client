import clsx from "clsx"
import { useAtom } from "jotai"
import { useEffect, useMemo } from "react"

import { ChooseModal } from "@nfid-frontend/ui"

import { Copy } from "../../atoms/copy"
import { DropdownSelect } from "../../atoms/dropdown-select"
import { QRCode } from "../../atoms/qrcode"
import { IGroupedOptions } from "../../molecules/choose-modal/types"
import { transferModalAtom } from "./state"
import { IWallet } from "./types"

interface ITransferModalReceive {
  wallets: IWallet[] | undefined
  walletOptions: IGroupedOptions[]
}

export const TransferModalReceive: React.FC<ITransferModalReceive> = ({
  walletOptions,
  wallets,
}) => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  const selectedWallet = useMemo(() => {
    const wallet = wallets?.find((wallet) => {
      return [wallet.principal?.toText(), wallet.address].includes(
        transferModalState.selectedWallets[0],
      )
    })

    return wallet
  }, [transferModalState.selectedWallets, wallets])

  useEffect(() => {
    if (walletOptions && !selectedWallet) {
      setTransferModalState({
        ...transferModalState,
        selectedWallets: [walletOptions[0]?.options[0]?.value],
      })
    }
  }, [setTransferModalState, transferModalState, wallets])

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-col space-y-2.5 text-black">
        <ChooseModal
          label="Select your account"
          title={"Choose an account"}
          optionGroups={walletOptions}
          onSelect={(value) =>
            setTransferModalState({
              ...transferModalState,
              selectedWallets: [value],
            })
          }
        />

        <div>
          <p className="mb-1 text-xs text-secondary">Account ID</p>
          <div
            className={clsx(
              "h-[40px] text-secondary bg-gray-100 rounded-md",
              "flex items-center justify-between px-2.5 space-x-2",
            )}
            id="account-id"
          >
            <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {selectedWallet?.address}
            </p>
            <Copy
              className="w-[18px] h-[18px] flex-shrink-0"
              value={selectedWallet?.address ?? ""}
            />
          </div>
        </div>
        <div className={clsx(selectedWallet?.isVaultWallet && "hidden")}>
          <p className="mb-1 text-xs text-secondary">Principal ID</p>
          <div
            className={clsx(
              "h-[40px] text-secondary bg-gray-100 rounded-md",
              "flex items-center justify-between px-2.5 space-x-2",
            )}
            id="principal-id"
          >
            <p className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
              {selectedWallet?.principal?.toText()}
            </p>
            <Copy
              className="w-[18px] h-[18px] flex-shrink-0"
              value={selectedWallet?.principal?.toText() ?? ""}
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
