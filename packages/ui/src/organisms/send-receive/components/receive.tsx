import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { FC } from "react"

import { Copy, CenterEllipsis } from "@nfid-frontend/ui"

export interface ReceiveProps {
  selectedAccountAddress: string
  address: string
  vaultCanister: string
  vaultAddress?: string
  vaultPrincipalAddress?: string
  autoConversionBtcAddress?: string
  btcAddress?: string
  ethAddress?: string
}

export const Receive: FC<ReceiveProps> = ({
  selectedAccountAddress,
  address,
  vaultCanister,
  vaultAddress,
  vaultPrincipalAddress,
  autoConversionBtcAddress,
  btcAddress,
  ethAddress,
}) => {
  return (
    <>
      <div
        className={clsx(
          "leading-10 text-[20px] font-bold mb-[18px]",
          "flex justify-between items-center",
        )}
      >
        Receive
      </div>
      <p className="text-sm mb-[18px]">
        {vaultCanister ? (
          "Share this address to receive funds into your Vault."
        ) : (
          <>
            NFID Wallet currently supports ICP, ICRC-1 EXT NFTs,
            <br className="hidden sm:block" />
            Ethereum, and Bitcoin, with more support coming soon.
          </>
        )}
      </p>
      {vaultCanister ? (
        <div className="flex flex-col gap-2.5">
          <div>
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              Vault address
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
              {vaultPrincipalAddress ? (
                <>
                  {vaultPrincipalAddress}
                  <Copy value={vaultPrincipalAddress} />
                </>
              ) : (
                <Spinner className="w-5 h-5 mx-auto text-black dark:text-white" />
              )}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              Vault account ID (for deposits from exchanges)
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
              {vaultAddress ? (
                <>
                  <CenterEllipsis
                    value={vaultAddress}
                    leadingChars={29}
                    trailingChars={5}
                    id={"vaultAddress"}
                  />
                  <Copy value={vaultAddress} />
                </>
              ) : (
                <Spinner className="w-5 h-5 mx-auto text-black dark:text-white" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2.5">
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              ICP wallet address
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
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
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              Account ID (for deposits from exchanges)
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
              <CenterEllipsis
                value={address ?? ""}
                leadingChars={29}
                trailingChars={5}
                id={"address"}
              />
              <Copy value={address} />
            </div>
          </div>
          <div className="mb-2.5">
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              BTC wallet address
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
              {btcAddress ? (
                <>
                  <CenterEllipsis
                    value={btcAddress ?? ""}
                    leadingChars={29}
                    trailingChars={5}
                    id={"btcAddress"}
                  />
                  <Copy value={btcAddress ?? ""} />
                </>
              ) : (
                <Spinner className="w-5 h-5 mx-auto text-black dark:text-white" />
              )}
            </div>
          </div>
          <div className="mb-2.5">
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              BTC wallet address for auto-conversion to ckBTC
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
              {autoConversionBtcAddress ? (
                <>
                  <CenterEllipsis
                    value={autoConversionBtcAddress ?? ""}
                    leadingChars={29}
                    trailingChars={5}
                    id={"autoConversionBtcAddress"}
                  />
                  <Copy value={autoConversionBtcAddress ?? ""} />
                </>
              ) : (
                <Spinner className="w-5 h-5 mx-auto text-black dark:text-white" />
              )}
            </div>
            <p className="text-xs tracking-[0.16px] text-gray-400 dark:text-zinc-500 mt-1 font-inter">
              ckBTC will be received by your wallet after 6 Bitcoin network{" "}
              <br className="hidden sm:block" />
              confirmations. This usually takes about 90 minutes.
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">
              EVM wallet address
            </p>
            <div className="rounded-[12px] bg-gray-100 dark:bg-[#FFFFFF0D] text-gray-500 dark:text-zinc-400 flex items-center justify-between px-2.5 h-[56px] text-sm">
              {ethAddress ? (
                <>
                  <CenterEllipsis
                    value={ethAddress ?? ""}
                    leadingChars={29}
                    trailingChars={5}
                    id={"ethAddress"}
                  />
                  <Copy value={ethAddress ?? ""} />
                </>
              ) : (
                <Spinner className="w-5 h-5 mx-auto text-black dark:text-white" />
              )}
            </div>
            <p className="text-xs tracking-[0.16px] text-gray-400 dark:text-zinc-500 mt-1 font-inter">
              Use this address for transactions on Ethereum, Base, Arbitrum,
              <br className="hidden sm:block" />
              and Polygon networks.
            </p>
          </div>
        </>
      )}
    </>
  )
}
