import clsx from "clsx"
import { FC, useState } from "react"
import { toast } from "react-toastify"
import { mutate } from "swr"

import {
  IconSvgEyeClosed,
  IconSvgEyeShown,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"

interface FilteredTokenProps {
  token: FT
}

export const FilteredToken: FC<FilteredTokenProps> = ({ token }) => {
  const [isHidden, setIsHidden] = useState(token.getTokenState() === "Active")

  const mutateTokens = () => {
    mutate("activeTokens")
    mutate((key) => Array.isArray(key) && key[0] === "allTokens")
  }

  const hideToken = async (token: FT) => {
    setIsHidden(!isHidden)
    try {
      await token.hideToken()
      mutateTokens()
    } catch (e) {
      toast.error("Token hiding failed: ", (e as any).message)
    }
  }

  const showToken = async (token: FT) => {
    setIsHidden(!isHidden)
    try {
      await token.showToken()
      mutateTokens()
    } catch (e) {
      toast.error("Token shhowing failed: ", (e as any).message)
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
