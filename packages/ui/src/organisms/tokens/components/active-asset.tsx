import clsx from "clsx"
import { HTMLAttributes, FC, useState } from "react"
import { FT } from "src/integration/ft/ft"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
  IDropdownPosition,
  IconCmpConvert,
  IconCmpStakeAction,
} from "@nfid-frontend/ui"
import { ArrowPercentChange } from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"

import { IProfileConstants } from ".."
import { AssetDropdown } from "./asset-dropdown"

interface ActiveTokenProps extends HTMLAttributes<HTMLDivElement> {
  token: FT
  tokens: FT[]
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
  onSwapClick: (value: string) => void
  onConvertToBtc: () => any
  onConvertToCkBtc: () => any
  onStakeClick: (value: string) => void
  setToken: (value: FT) => void
  dropdownPosition: IDropdownPosition
  loadingToken: FT | null
  hideZeroBalance?: boolean
  isIniting?: boolean
}

export const ActiveToken: FC<ActiveTokenProps> = ({
  token,
  tokens,
  profileConstants,
  onSendClick,
  onSwapClick,
  onConvertToBtc,
  onConvertToCkBtc,
  onStakeClick,
  setToken,
  dropdownPosition,
  loadingToken,
  hideZeroBalance,
  isIniting,
  ...props
}) => {
  const [isTokenProcessed, setIsTokenProcessed] = useState(false)
  const tokenRateDayChange = token.getTokenRateDayChangePercent()
  const usdBalance = token.getUSDBalanceFormatted(false)
  const tokenPrice = token.getTokenRateFormatted("1", false)

  if (
    hideZeroBalance &&
    token.getTokenBalance() === BigInt(0) &&
    token.isHideable()
  )
    return null

  return (
    <tr
      id={`token_${token.getTokenName().replace(/\s+/g, "")}`}
      {...props}
      className={clsx({
        "opacity-30": isTokenProcessed || loadingToken === token,
      })}
    >
      <td className="flex items-center py-[10px] sm:py-0 sm:h-16 pr-[10px] sm:pr-[30px] flex-grow min-w-0 sm:w-auto">
        <div className="w-[24px] h-[24px] sm:w-[40px] sm:h-[40px] mr-[12px] rounded-full bg-zinc-50">
          <ImageWithFallback
            alt={`${token.getTokenSymbol()}`}
            fallbackSrc={IconNftPlaceholder}
            src={`${token.getTokenLogo()}`}
            className={clsx(
              "w-[24px] h-[24px] sm:w-[40px] sm:h-[40px]",
              "rounded-full object-cover min-w-[24px] sm:min-w-[40px]",
            )}
          />
        </div>
        <div className="sm:overflow-hidden sm:text-ellipsis sm:whitespace-nowrap">
          <p
            className="text-sm font-semibold leading-[25px] flex items-center"
            id={`token_${token.getTokenName().replace(/\s/g, "")}_currency`}
            onClick={() => onStakeClick(token.getTokenAddress())}
          >
            {token.getTokenSymbol()}
            {token.getTokenAddress() === BTC_NATIVE_ID && (
              <>
                <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                <span
                  className="flex items-center text-xs cursor-pointer text-primaryButtonColor"
                  onClick={onConvertToCkBtc}
                >
                  <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor" />
                  Convert to ckBTC
                </span>
              </>
            )}
            {token.getTokenAddress() === CKBTC_CANISTER_ID && (
              <>
                <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                <span
                  className="flex items-center text-xs cursor-pointer text-primaryButtonColor"
                  onClick={onConvertToBtc}
                >
                  <IconCmpConvert className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor" />
                  Convert to BTC
                </span>
              </>
            )}
            {(token.getTokenCategory() === Category.Sns ||
              token.getTokenAddress() === ICP_CANISTER_ID) && (
              <>
                <div className="mx-[6px] rounded-[50%] w-[2px] h-[2px] bg-gray-400" />
                <span className="flex items-center text-xs cursor-pointer text-primaryButtonColor">
                  <IconCmpStakeAction className="mr-[4px] h-[14px] w-[14px] text-primaryButtonColor" />
                  Stake
                </span>
              </>
            )}
          </p>
          <p className="text-secondary text-xs leading-[20px]">
            {token.getTokenName()}
          </p>
        </div>
      </td>
      <td
        id={`token_${token
          .getTokenCategoryFormatted()
          .replace(/\s/g, "")}_category`}
        className="hidden md:table-cell pr-[10px] min-w-[120px]"
      >
        {token.getTokenCategoryFormatted()}
      </td>
      <td className="pr-[10px] hidden md:table-cell min-w-[120px]">
        {isIniting ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : tokenPrice ? (
          <div>
            <div id={`token_${token.getTokenName().replace(/\s/g, "")}_price`}>
              {tokenPrice}
            </div>
            {tokenRateDayChange && (
              <ArrowPercentChange
                value={tokenRateDayChange?.value || "0"}
                positive={tokenRateDayChange?.positive}
              />
            )}
          </div>
        ) : (
          "Not listed"
        )}
      </td>
      <td
        id={`token_${token.getTokenName().replace(/\s/g, "")}_balance`}
        className="pr-[10px] text-right md:text-left pr-[10px] flex-grow min-w-0 sm:w-auto min-w-[120px]"
      >
        {isIniting ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : (
          <p className="flex items-center justify-end md:justify-start">
            <span
              className="overflow-hidden text-right text-ellipsis whitespace-nowrap"
              style={{
                maxWidth:
                  window.innerWidth < 430 ||
                  (window.innerWidth >= 768 && window.innerWidth < 1024)
                    ? "120px"
                    : "none",
              }}
            >
              {token.getTokenBalanceFormatted() || "0"}
            </span>
            &nbsp;
            <span>{token.getTokenSymbol()}</span>
          </p>
        )}
        <p className="text-xs md:hidden text-secondary">
          &nbsp;
          {isIniting ? (
            <Skeleton
              className={clsx("max-w-full h-[10px] w-[50px] ml-auto")}
            />
          ) : !usdBalance ? (
            "Not listed"
          ) : (
            usdBalance
          )}
        </p>
      </td>
      <td
        id={`token_${token.getTokenName().replace(/\s/g, "")}_usd`}
        className="pr-[10px] hidden md:table-cell pr-[10px]"
      >
        {isIniting ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : token.getUSDBalanceFormatted() === undefined ? (
          "Not listed"
        ) : (
          token.getUSDBalanceFormatted()
        )}
      </td>
      <td
        className="w-[24px] min-w-[30px] lg:min-w-[50px] lg:ps-[25px]"
        id={`${token.getTokenName()}_options`}
      >
        <AssetDropdown
          token={token}
          tokens={tokens}
          profileConstants={profileConstants}
          onSendClick={onSendClick}
          onSwapClick={onSwapClick}
          onConvertToBtc={onConvertToBtc}
          onConvertToCkBtc={onConvertToCkBtc}
          onStakeClick={onStakeClick}
          setToken={setToken}
          dropdownPosition={dropdownPosition}
          setIsTokenProcessed={setIsTokenProcessed}
          isTokenProcessed={isTokenProcessed || loadingToken === token}
        />
      </td>
    </tr>
  )
}
