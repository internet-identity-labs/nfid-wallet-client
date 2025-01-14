import clsx from "clsx"
import { HTMLAttributes, FC, useState } from "react"
import { FT } from "src/integration/ft/ft"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
  IDropdownPosition,
} from "@nfid-frontend/ui"
import { ArrowPercentChange } from "@nfid-frontend/ui"

import { IProfileConstants } from ".."
import { useTokenInit } from "../../send-receive/hooks/token-init"
import { AssetDropdown } from "./asset-dropdown"

interface ActiveTokenProps extends HTMLAttributes<HTMLDivElement> {
  token: FT
  tokens: FT[]
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
  setToken: (value: FT) => void
  dropdownPosition: IDropdownPosition
  loadingToken: FT | null
  hideZeroBalance?: boolean
}

export const ActiveToken: FC<ActiveTokenProps> = ({
  token,
  tokens,
  profileConstants,
  onSendClick,
  setToken,
  dropdownPosition,
  loadingToken,
  hideZeroBalance,
  ...props
}) => {
  const [isTokenProcessed, setIsTokenProcessed] = useState(false)
  const tokenPrice = token.getTokenRateFormatted("1")
  const tokenRateDayChange = token.getTokenRateDayChangePercent()
  const initedToken = useTokenInit(token)

  if (
    initedToken &&
    hideZeroBalance &&
    initedToken.getTokenBalance() === BigInt(0)
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
            alt={`${token.getTokenSymbol}`}
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
            className="text-sm font-semibold leading-[25px]"
            id={`token_${token.getTokenName().replace(/\s/g, "")}_currency`}
          >
            {token.getTokenSymbol()}
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
        {!initedToken ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : tokenPrice ? (
          <div>
            <div>{tokenPrice}</div>
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
        {!initedToken ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : (
          <p className="flex items-center justify-end md:justify-start">
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap text-right"
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
          {!initedToken ? (
            <Skeleton
              className={clsx("max-w-full h-[10px] w-[50px] ml-auto")}
            />
          ) : token.getUSDBalanceFormatted() === undefined ? (
            "Not listed"
          ) : (
            token.getUSDBalanceFormatted()
          )}
        </p>
      </td>
      <td
        id={`token_${token.getTokenName().replace(/\s/g, "")}_usd`}
        className="pr-[10px] hidden md:table-cell pr-[10px]"
      >
        {!initedToken ? (
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
          setToken={setToken}
          dropdownPosition={dropdownPosition}
          setIsTokenProcessed={setIsTokenProcessed}
          isTokenProcessed={isTokenProcessed || loadingToken === token}
        />
      </td>
    </tr>
  )
}
