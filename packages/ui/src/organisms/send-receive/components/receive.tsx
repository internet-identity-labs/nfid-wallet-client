import clsx from "clsx"
import { FC } from "react"

import { Copy, CenterEllipsis } from "@nfid-frontend/ui"

export interface ReceiveProps {
  selectedAccountAddress: string
  address: string
  setSelectedAccountAddress: (value: React.SetStateAction<string>) => void
}

export const Receive: FC<ReceiveProps> = ({
  selectedAccountAddress,
  address,
}) => {
  return (
    <>
      <p className="text-sm mb-[18px]">
        NFID Wallet currently supports Internet Computer Protocol{" "}
        <br className="hidden sm:block" />
        tokens and standards: ICP, ICRC-1, EXT NFTs, and additional support
        coming soon.
      </p>
      <div>
        <p className="mb-1 text-gray-500">Wallet address</p>
        <div className="rounded-[12px] bg-gray-100 text-gray-500 flex items-center justify-between px-2.5 h-[56px] text-sm">
          <CenterEllipsis
            value={selectedAccountAddress ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"principal"}
          />
          <Copy value={selectedAccountAddress} />
        </div>
      </div>
      <div className="mb-2.5 sm:mb-5">
        <p className="mt-[10px] mb-1 text-gray-500">
          Account ID (for deposits from exchanges)
        </p>
        <div className="rounded-[12px] bg-gray-100 text-gray-500 flex items-center justify-between px-2.5 h-[56px] text-sm">
          <CenterEllipsis
            value={address ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"address"}
          />
          <Copy value={address} />
        </div>
      </div>
      <div
        className={clsx(
          "absolute top-0 left-0 z-50 w-full h-full p-5 bg-white transition-all duration-200 ease-in-out",
          "-translate-x-full",
        )}
      ></div>
    </>
  )
}
