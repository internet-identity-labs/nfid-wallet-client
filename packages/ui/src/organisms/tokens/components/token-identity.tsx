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
  CKSEPOLIA_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  EVM_NATIVE,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category, ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { getNetworkIcon } from "packages/ui/src/utils/network-icon"
import { useDarkTheme } from "frontend/hooks"
import { SelectedToken } from "frontend/features/transfer-modal/types"
import {
  getCkErc20ByErc20Address,
  getCkErc20ByLedgerId,
  isCkErc20Token,
} from "@nfid/integration/token/ckerc20.config"

interface TokenIdentityProps extends HTMLAttributes<HTMLDivElement> {
  token: FT
  onConvertToBtc?: () => void
  onConvertToCkBtc?: () => void
  onConvertToEth?: () => void
  onConvertToCkEth?: () => void
  onConvertToSepoliaEth?: () => void
  onConvertToCkSepoliaEth?: () => void
  onConvertToErc20?: (tokenAddress: string) => void
  onConvertToCkErc20?: (tokenAddress: string) => void
  onStakeClick?: (value: SelectedToken) => void
  withNetwork?: boolean
  withActions?: boolean
  isActive?: boolean
  disabled?: boolean
  mobileSize?: number
}

export const TokenIdentity: FC<TokenIdentityProps> = ({
  token,
  onConvertToBtc,
  onConvertToCkBtc,
  onConvertToEth,
  onConvertToCkEth,
  onConvertToSepoliaEth,
  onConvertToCkSepoliaEth,
  onConvertToErc20,
  onConvertToCkErc20,
  onStakeClick,
  withNetwork = true,
  withActions = false,
  isActive = true,
  disabled = false,
  mobileSize = 24,
}) => {
  const isDarkTheme = useDarkTheme()

  return (
    <div className="flex items-center">
      <div
        className={clsx(
          "sm:w-[40px] sm:h-[40px] mr-[12px] rounded-full bg-zinc-50 relative",
          `w[${mobileSize}px] h-[${mobileSize}px]`,
        )}
      >
        <ImageWithFallback
          alt={`${token.getTokenSymbol()}`}
          fallbackSrc={IconNftPlaceholder}
          src={`${token.getTokenLogo()}`}
          className={clsx(
            "sm:w-[40px] sm:h-[40px] rounded-full object-cover sm:min-w-[40px]",
            `w-[${mobileSize}px] h-[${mobileSize}px] min-w-[${mobileSize}px]`,
            disabled && "grayscale opacity-40",
          )}
        />
        {withNetwork && (
          <div className="absolute bottom-[-5px] right-[-5px] sm:bottom-0 sm:right-0 w-[18px] h-[18px] rounded-[6px] bg-white dark:bg-zinc-800">
            {getNetworkIcon(token.getChainId(), isDarkTheme)}
          </div>
        )}
      </div>
      <div className="sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap">
        <p
          className={clsx(
            "text-sm dark:text-white font-semibold leading-[25px] flex items-center",
            isActive && !disabled
              ? "text-black dark:text-white"
              : "text-secondary dark:text-zinc-500",
          )}
          id={`token_${token.getTokenName().replace(/\s/g, "")}_${token.getChainId()}_currency`}
        >
          {token.getTokenSymbol()}
          {withActions && (
            <>
              {token.getTokenAddress() === BTC_NATIVE_ID && (
                <>
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
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
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToCkEth}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to ckETH
                  </span>
                </>
              )}
              {token.getTokenAddress() === EVM_NATIVE &&
                token.getChainId() === ChainId.ETH_SEPOLIA && (
                  <>
                    <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                    <span
                      className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                      onClick={onConvertToCkSepoliaEth}
                    >
                      <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                      Convert to ckSepoliaETH
                    </span>
                  </>
                )}
              {token.getTokenAddress() === CKBTC_CANISTER_ID && (
                <>
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
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
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToEth}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to ETH
                  </span>
                </>
              )}
              {token.getTokenAddress() === CKSEPOLIA_LEDGER_CANISTER_ID && (
                <>
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={onConvertToSepoliaEth}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to Sepolia ETH
                  </span>
                </>
              )}
              {isCkErc20Token(token.getTokenAddress()) && (
                <>
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={() => onConvertToErc20?.(token.getTokenAddress())}
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to{" "}
                    {
                      getCkErc20ByLedgerId(token.getTokenAddress())
                        ?.underlyingSymbol
                    }
                  </span>
                </>
              )}
              {getCkErc20ByErc20Address(token.getTokenAddress()) && (
                <>
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={() =>
                      onConvertToCkErc20?.(token.getTokenAddress())
                    }
                  >
                    <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Convert to{" "}
                    {getCkErc20ByErc20Address(token.getTokenAddress())?.symbol}
                  </span>
                </>
              )}
              {(token.getTokenCategory() === Category.Sns ||
                token.getTokenAddress() === ICP_CANISTER_ID) && (
                <>
                  <span className="block mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                  <span
                    className="flex items-center text-xs cursor-pointer text-primaryButtonColor dark:text-teal-500"
                    onClick={() =>
                      onStakeClick?.({
                        address: token.getTokenAddress(),
                        chainId: token.getChainId(),
                      })
                    }
                  >
                    <IconCmpStakeAction className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor dark:text-teal-500" />
                    Stake
                  </span>
                </>
              )}
            </>
          )}
        </p>
        <p className="text-secondary text-xs leading-[20px] dark:text-zinc-500">
          {token.getTokenName()}
        </p>
      </div>
    </div>
  )
}
