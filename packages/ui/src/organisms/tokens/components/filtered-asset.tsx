import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { FC } from "react"
import { mutate } from "swr"

import {
  IconSvgEyeClosed,
  IconSvgEyeShown,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"

import { generateTokenKey, getUserPrincipalId } from "../utils"

interface FilteredTokenProps {
  token: FT
  tokens: FT[]
  onTokensUpdate: () => void
  setKey: (v: string) => void
}

export const FilteredToken: FC<FilteredTokenProps> = ({
  token,
  tokens,
  onTokensUpdate,
  setKey,
}) => {
  const hideToken = async (token: FT) => {
    try {
      token.hideToken()
      //const updatedTokens = [...tokens]

      const updatedKey = generateTokenKey(tokens)
      console.log("hideToken", updatedKey)
      //setKey(updatedKey)
      mutate(["tokens", updatedKey], tokens, false)
    } catch (e) {
      toaster.error("Token hiding failed: " + (e as Error).message)
    }
  }

  const showToken = async (token: FT) => {
    try {
      token.showToken()
      const { publicKey } = await getUserPrincipalId()

      if (!token.isInited()) {
        await token.init(Principal.fromText(publicKey))
      }
      const updatedKey = generateTokenKey(tokens)
      //setKey(updatedKey)
      // console.log("showToken", updatedKey)
      await mutate(["tokens", updatedKey], tokens, false)
    } catch (e) {
      toaster.error("Token shhowing failed: " + (e as Error).message)
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
              token.getTokenState() === State.Active
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
          src={
            token.getTokenState() === State.Active
              ? IconSvgEyeShown
              : IconSvgEyeClosed
          }
          alt="Show NFID asset"
          onClick={() =>
            token.getTokenState() === State.Active
              ? hideToken(token)
              : showToken(token)
          }
        />
      </div>
    </div>
  )
}
