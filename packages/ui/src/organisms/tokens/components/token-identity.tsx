import clsx from "clsx"
import { HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  IconCmpConvert,
  IconCmpStakeAction,
} from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { NetworkIcon } from "packages/ui/src/utils/network-icon"

interface TokenIdentityProps extends HTMLAttributes<HTMLDivElement> {
  token: FT
  onConvertToBtc?: () => void
  onConvertToCkBtc?: () => void
  onConvertToEth?: () => void
  onConvertToCkEth?: () => void
  onStakeClick?: (value: string) => void
  withNetwork?: boolean
  withActions?: boolean
  isActive?: boolean
  disabled?: boolean
}

export const TokenIdentity: FC<TokenIdentityProps> = ({
  token,
  onConvertToBtc,
  onConvertToCkBtc,
  onConvertToEth,
  onConvertToCkEth,
  onStakeClick,
  withNetwork = true,
  withActions = false,
  isActive = true,
  disabled = false,
}) => {
  return (
    <div className="flex items-center">
      <div className="w-[24px] h-[24px] sm:w-[40px] sm:h-[40px] mr-[12px] rounded-full bg-zinc-50 relative">
        <ImageWithFallback
          alt={`${token.getTokenSymbol()}`}
          fallbackSrc={IconNftPlaceholder}
          src={`${token.getTokenLogo()}`}
          className={clsx(
            "w-[24px] h-[24px] sm:w-[40px] sm:h-[40px]",
            "rounded-full object-cover min-w-[24px] sm:min-w-[40px]",
            disabled && "grayscale opacity-40",
          )}
        />
        {withNetwork && (
          <div className="absolute bottom-[-5px] right-[-5px] sm:bottom-0 sm:right-0 w-[18px] h-[18px] rounded-[6px] bg-white dark:bg-zinc-800">
            <NetworkIcon chainId={token.getChainId()} />
          </div>
        )}
      </div>
      <div className="sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap">
        <p
          className={clsx(
            "text-sm dark:text-white font-semibold leading-[25px] flex items-center",
            isActive && !disabled
              ? "text-black dark:text-white"
              : "text-secondary dark:text-zinc-400",
          )}
          id={`token_${token.getTokenName().replace(/\s/g, "")}_${token.getChainId()}_currency`}
        >
          {token.getTokenSymbol()}
          {withActions && (
            <>
              {token.getTokenAddress() === BTC_NATIVE_ID && (
                <>
                  <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToCkBtc}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to ckBTC
                  </span>
                </>
              )}
              {token.getTokenAddress() === ETH_NATIVE_ID && (
                <>
                  <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToCkEth}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to ckETH
                  </span>
                </>
              )}
              {token.getTokenAddress() === CKBTC_CANISTER_ID && (
                <>
                  <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToBtc}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to BTC
                  </span>
                </>
              )}
              {token.getTokenAddress() === CKETH_LEDGER_CANISTER_ID && (
                <>
                  <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToEth}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to ETH
                  </span>
                </>
              )}
              {(token.getTokenCategory() === Category.Sns ||
                token.getTokenAddress() === ICP_CANISTER_ID) && (
                <>
                  <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={() => onStakeClick?.(token.getTokenAddress())}
                  >
                    <IconCmpStakeAction className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Stake
                  </span>
                </>
              )}
            </>
          )}
        </p>
        <p className="text-secondary text-xs leading-[20px] dark:text-zinc-400">
          {token.getTokenName()}
        </p>
      </div>
    </div>
  )
}
