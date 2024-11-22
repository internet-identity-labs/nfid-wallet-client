import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { FC, useState } from "react"
import useSWR from "swr"

import {
  IconSvgEyeClosed,
  IconSvgEyeShown,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"

import { fetchActiveTokens, mutateTokens, TokenAction } from "../utils"

interface FilteredTokenProps {
  token: FT
  allTokens: FT[]
}

export const FilteredToken: FC<FilteredTokenProps> = ({ token, allTokens }) => {
  const [isHidden, setIsHidden] = useState(token.getTokenState() === "Active")

  const { data: activeTokens = [] } = useSWR(
    "activeTokens",
    fetchActiveTokens,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const hideToken = async (token: FT) => {
    setIsHidden(!isHidden)
    try {
      token.hideToken()
      mutateTokens(TokenAction.HIDE, token, activeTokens, allTokens)
    } catch (e) {
      toaster.error("Token hiding failed: " + (e as any).message)
    }
  }

  const showToken = async (token: FT) => {
    setIsHidden(!isHidden)
    try {
      token.showToken()
      mutateTokens(TokenAction.SHOW, token, activeTokens, allTokens)
    } catch (e) {
      toaster.error("Token shhowing failed: " + (e as any).message)
    }
  }

  return (
    <div className="flex items-center h-[60px]">
      <div className="flex items-center gap-[12px] flex-0 w-[210px]">
        <div className="w-[28px] h-[28px] rounded-full bg-zinc-50">
          <ImageWithFallback
            alt={`${token.getTokenSymbol()}`}
            className="object-cover w-full h-full rounded-full"
            fallbackSrc={IconNftPlaceholder}
            src={`${token.getTokenLogo()}`}
          />
        </div>
        <div>
          <p
            className={clsx(
              "text-sm text-black leading-[20px] font-semibold",
              token.getTokenState() === "Active"
                ? "text-black"
                : "text-secondary",
            )}
          >
            {token.getTokenSymbol()}
          </p>
          <p className="text-xs text-secondary leading-[20px]">
            {token.getTokenName()}
          </p>
        </div>
      </div>
      <div className="text-sm">{token.getTokenCategoryFormatted()}</div>
      <div className="ml-auto">
        <img
          className="cursor-pointer"
          src={isHidden ? IconSvgEyeShown : IconSvgEyeClosed}
          alt="Show NFID asset"
          onClick={() =>
            token.getTokenState() === "Active"
              ? hideToken(token)
              : showToken(token)
          }
        />
      </div>
    </div>
  )
}
