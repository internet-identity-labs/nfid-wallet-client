import { FC } from "react"

import { Copy, CenterEllipsis } from "@nfid-frontend/ui"

export interface ReceiveProps {
  selectedAccountAddress: string
  address: string
  autoConversionBtcAddress?: string
  btcAddress?: string
}

export const Receive: FC<ReceiveProps> = ({
  selectedAccountAddress,
  address,
  autoConversionBtcAddress,
  btcAddress,
}) => {
  return (
    <>
      <p className="text-sm mb-[18px]">
        NFID Wallet currently supports ICP, ICRC-1 EXT NFTs, and{" "}
        <br className="hidden sm:block" />
        Bitcoin, with more support coming soon.
      </p>
      <div className="mb-2.5">
        <p className="mb-1 text-xs text-gray-500">ICP wallet address</p>
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
      <div className="mb-2.5">
        <p className="mb-1 text-xs text-gray-500">
          Account ID (for deposits from exchanges)
        </p>
        <div className="rounded-[12px] bg-gray-100 text-gray-500 flex items-center justify-between px-2.5 h-[56px] text-sm">
          <CenterEllipsis
            value={address ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"address"}
          />
          <Copy value={selectedAccountAddress} />
        </div>
      </div>
      <div className="mb-2.5">
        <p className="mb-1 text-xs text-gray-500">BTC wallet address</p>
        <div className="rounded-[12px] bg-gray-100 text-gray-500 flex items-center justify-between px-2.5 h-[56px] text-sm">
          <CenterEllipsis
            value={btcAddress ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"btcAddress"}
          />
          <Copy value={btcAddress ?? ""} />
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-500">
          BTC wallet address for auto-conversion to ckBTC (your wallet will{" "}
          <br className="hidden sm:block" />
          receive ckBTC in 6 Bitcoin network confirmations / ~90 min)
        </p>
        <div className="rounded-[12px] bg-gray-100 text-gray-500 flex items-center justify-between px-2.5 h-[56px] text-sm">
          <CenterEllipsis
            value={autoConversionBtcAddress ?? ""}
            leadingChars={29}
            trailingChars={5}
            id={"autoConversionBtcAddress"}
          />
          <Copy value={autoConversionBtcAddress ?? ""} />
        </div>
      </div>
    </>
  )
}
