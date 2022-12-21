import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { principalToAddress } from "ictool"
import { useEffect, useState } from "react"

import { Copy } from "../../atoms/copy"
import { DropdownSelect } from "../../atoms/dropdown-select"
import { QRCode } from "../../atoms/qrcode"
import { IWallet } from "./types"

interface ITransferModalReceive {
  wallets: IWallet[] | undefined
  walletOptions: { label: string; value: string }[]
}

export const TransferModalReceive: React.FC<ITransferModalReceive> = ({
  walletOptions,
  wallets,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string[]>([])

  useEffect(() => {
    if (wallets?.length)
      return setSelectedWallet([wallets[0].principal?.toText() ?? ""])
  }, [wallets])

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex flex-col space-y-2.5 text-black-base">
        <DropdownSelect
          label="Select your wallet"
          options={walletOptions ?? []}
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
            <Copy
              className="w-[18px] h-[18px] flex-shrink-0"
              value={
                selectedWallet.length
                  ? principalToAddress(
                      Principal.fromText(selectedWallet[0] ?? "") as any,
                    )
                  : ""
              }
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
            <Copy
              className="w-[18px] h-[18px] flex-shrink-0"
              value={selectedWallet[0]}
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
