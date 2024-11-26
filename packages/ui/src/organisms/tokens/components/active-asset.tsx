import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { HTMLAttributes, FC, useEffect, useState } from "react"
import { FT } from "src/integration/ft/ft"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
  IDropdownPosition,
} from "@nfid-frontend/ui"

import { IProfileConstants } from ".."
import { getUserPrincipalId } from "../utils"
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
  const [isBalanceLoading, setIsBalanceLoading] = useState(true)

  useEffect(() => {
    const initToken = async () => {
      const { publicKey } = await getUserPrincipalId()
      const principal = Principal.fromText(publicKey)

      await token.init(principal)
      setIsBalanceLoading(false)
    }

    initToken()
  }, [token])

  return (
    <tr id={`token_${token.getTokenName().replace(/\s+/g, "")}`} {...props}>
      <td className="flex items-center h-16 pr-[10px] sm:pr-[30px] max-w-[150px] xs:max-w-[100%] sm:max-w-[100%] lg:w-[350px]">
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
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          <p
            className="text-sm font-semibold leading-[25px]"
            id={`token_${token.getTokenName().replace(/\s/g, "")}_currency`}
          >
            {token.getTokenSymbol()}
          </p>
          <p className="text-secondary text-xs leading-[20px] overflow-hidden text-ellipsis whitespace-nowrap">
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
        className="pr-[10px] text-right md:text-left pr-[10px] max-w-[40%] min-w-[40%] sm:max-w-[50%] sm:min-w-[50%]"
      >
        <p className="flex items-center justify-end md:block">
          {isBalanceLoading ? (
            <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
          ) : (
            <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[70px]">
              {token.getTokenBalanceFormatted() || "0"}{" "}
              <span>{token.getTokenSymbol()}</span>
            </span>
          )}
        </p>
        <p className="text-xs md:hidden text-secondary">
          &nbsp;
          {isBalanceLoading ? (
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
        {isBalanceLoading ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : token.getUSDBalanceFormatted() === undefined ? (
          "Not listed"
        ) : (
          token.getUSDBalanceFormatted()
        )}
      </td>
      <td className="w-[24px] min-w-[24px]"
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
