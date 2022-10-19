import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import { IWallet } from "frontend/integration/wallet/hooks/types"
import { DropdownSelect } from "frontend/ui/atoms/dropdown-select"
import { QRCode } from "frontend/ui/atoms/qrcode"

import CopyIcon from "./assets/copy.svg"

interface ITransferModalReceive {
  wallets: IWallet[] | undefined
}

export const TransferModalReceive: React.FC<ITransferModalReceive> = ({
  wallets,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string[]>([])

  useEffect(() => {
    if (wallets?.length)
      return setSelectedWallet([wallets[0].principal?.toText() ?? ""])
  }, [wallets])

  const walletsOptions = useMemo(() => {
    return wallets?.map((wallet) => ({
      label: wallet.label ?? "",
      value: wallet.principal?.toText() ?? "",
    }))
  }, [wallets])

  const copyToClipboard = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, value: string) => {
      e.preventDefault()
      toast.info("Copied to clipboard", {
        toastId: `copied_${value}`,
      })
      navigator.clipboard.writeText(value)
    },
    [],
  )

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-col space-y-2.5 text-black-base">
        <DropdownSelect
          label="Select your wallet"
          options={walletsOptions ?? []}
          selectedValues={selectedWallet}
          setSelectedValues={setSelectedWallet}
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
              {selectedWallet.length &&
                principalToAddress(
                  Principal.fromText(selectedWallet[0]) as any,
                )}
            </p>
            <img
              src={CopyIcon}
              onClick={(e) =>
                copyToClipboard(
                  e,
                  principalToAddress(
                    Principal.fromText(selectedWallet[0] ?? "") as any,
                  ),
                )
              }
              className="cursor-pointer"
              alt="copy"
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
              {selectedWallet[0]}
            </p>
            <img
              src={CopyIcon}
              onClick={(e) => copyToClipboard(e, selectedWallet[0])}
              className="cursor-pointer"
              alt="copy"
            />
          </div>
        </div>
      </div>
      <div className="w-[179px] my-8 mx-auto">
        <QRCode
          options={{ width: 179, margin: 0 }}
          content={selectedWallet.length ? selectedWallet[0] : ""}
        />
      </div>
    </div>
  )
}
