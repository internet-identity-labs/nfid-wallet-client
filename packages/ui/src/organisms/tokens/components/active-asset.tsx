import clsx from "clsx"
import { HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"
import useSWR from "swr"

import {
  ImageWithFallback,
  IconNftPlaceholder,
  Skeleton,
} from "@nfid-frontend/ui"

import { IProfileConstants } from ".."
import { AssetDropdown } from "./asset-dropdown"

interface ActiveTokenProps extends HTMLAttributes<HTMLDivElement> {
  token: FT
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
}

export const ActiveToken: FC<ActiveTokenProps> = ({
  token,
  profileConstants,
  onSendClick,
}) => {
  const { data: usdPrice, isLoading } = useSWR(
    token ? ["activeTokenUSD", token.getTokenAddress()] : null,
    token ? () => token.getUSDBalanceFormatted() : null,
  )

  return (
    <tr id={`token_${token.getTokenName().replace(/\s+/g, "")}`}>
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
        <div>
          <p className="flex justify-end sm:block">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[70px]">
              {token.getTokenBalanceFormatted() || "0"}
            </span>
            &nbsp;
            <span>{token.getTokenSymbol()}</span>
          </p>
          <p className="text-xs md:hidden text-secondary">
            {isLoading ? (
              <Skeleton
                className={clsx("max-w-full h-[10px] w-[50px] ml-auto")}
              />
            ) : usdPrice === undefined ? (
              "Not listed"
            ) : (
              usdPrice
            )}
          </p>
        </div>
      </td>
      <td
        id={`token_${token.getTokenName().replace(/\s/g, "")}_usd`}
        className="pr-[10px] hidden md:table-cell pr-[10px]"
      >
        {isLoading ? (
          <Skeleton className={clsx("max-w-full h-[10px] w-[100px]")} />
        ) : usdPrice === undefined ? (
          "Not listed"
        ) : (
          usdPrice
        )}
      </td>
      <td className="w-[24px] min-w-[24px]">
        <AssetDropdown
          token={token}
          profileConstants={profileConstants}
          onSendClick={onSendClick}
        />
      </td>
    </tr>
  )
}
