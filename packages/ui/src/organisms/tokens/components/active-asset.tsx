import clsx from "clsx"
import { HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
  IDropdownPosition,
} from "@nfid-frontend/ui"

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
}

export const ActiveToken: FC<ActiveTokenProps> = ({
  token,
  tokens,
  profileConstants,
  onSendClick,
  setToken,
  dropdownPosition,
  ...props
}) => {
  const initedToken = useTokenInit(token)

  return (
    <tr id={`token_${token.getTokenName().replace(/\s+/g, "")}`} {...props}>
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
        className="hidden md:table-cell pr-[10px]"
      >
        {token.getTokenCategoryFormatted()}
      </td>
      <td
        id={`token_${token.getTokenName().replace(/\s/g, "")}_balance`}
        className="pr-[10px] text-right md:text-left pr-[10px] flex-grow min-w-0 sm:w-auto"
      >
        <div>
          {!initedToken ? (
            <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
          ) : (
            <p className="flex items-center justify-end md:block">
              <span
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                style={{ maxWidth: window.innerWidth < 430 ? "120px" : "none" }}
              >
                {token.getTokenBalanceFormatted() || "0"}
              </span>
              &nbsp;
              <span>{token.getTokenSymbol()}</span>
            </p>
          )}
        </div>
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
        className="w-[24px] min-w-[24px]"
        id={`${token.getTokenName()}_options`}
      >
        <AssetDropdown
          token={token}
          tokens={tokens}
          profileConstants={profileConstants}
          onSendClick={onSendClick}
          setToken={setToken}
          dropdownPosition={dropdownPosition}
        />
      </td>
    </tr>
  )
}
