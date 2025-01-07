import { Principal } from "@dfinity/principal"
import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/loader/spinner"
import toaster from "packages/ui/src/atoms/toast"
import { FC, useCallback, useState } from "react"

import {
  IconSvgEyeClosed,
  IconSvgEyeShown,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { mutateWithTimestamp } from "@nfid/swr"

import { FT } from "frontend/integration/ft/ft"

import { getUserPrincipalId } from "../utils"

interface FilteredTokenProps {
  token: FT
  tokens: FT[]
  setLoadingToken: (value: FT | null) => void
}

export const FilteredToken: FC<FilteredTokenProps> = ({
  token,
  tokens,
  setLoadingToken,
}) => {
  const [showTokenLoading, setShowTokenLoading] = useState(false)
  const [hideTokenLoading, setHideTokenLoading] = useState(false)

  const hideToken = useCallback(
    async (token: FT) => {
      try {
        setHideTokenLoading(true)
        setLoadingToken(token)
        await token.hideToken()
        const updatedTokens = [...tokens]
        await mutateWithTimestamp("tokens", updatedTokens, false)
      } catch (e) {
        toaster.error("Token hiding failed: " + (e as Error).message)
      } finally {
        setHideTokenLoading(false)
        setLoadingToken(null)
      }
    },
    [tokens],
  )

  const showToken = useCallback(
    async (token: FT) => {
      try {
        setShowTokenLoading(true)
        await token.showToken()
        const { publicKey } = await getUserPrincipalId()

        if (!token.isInited()) {
          await token.init(Principal.fromText(publicKey))
        }

        const updatedTokens = [...tokens]
        await mutateWithTimestamp("tokens", updatedTokens, false)
      } catch (e) {
        toaster.error("Token shhowing failed: " + (e as Error).message)
      } finally {
        setShowTokenLoading(false)
      }
    },
    [tokens],
  )

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
        {showTokenLoading || hideTokenLoading ? (
          <Spinner />
        ) : (
          <img
            id={`${token.getTokenName()}_showHideButton`}
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
        )}
      </div>
    </div>
  )
}
