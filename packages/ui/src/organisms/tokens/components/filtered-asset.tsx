import { Principal } from "@dfinity/principal"
import { Spinner } from "packages/ui/src/atoms/spinner"
import toaster from "packages/ui/src/atoms/toast"
import { FC, useCallback, useState } from "react"

import {
  IconSvgEyeClosed,
  IconSvgEyeShown,
  IconSvgEyeShownWhite,
} from "@nfid-frontend/ui"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { getUserPrincipalId } from "frontend/features/fungible-token/utils"
import { useDarkTheme } from "frontend/hooks"
import { FT } from "frontend/integration/ft/ft"
import { TokenIdentity } from "./token-identity"
import { getUpdatedInitedTokens } from "frontend/features/transfer-modal/utils"

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
  const isDarkTheme = useDarkTheme()

  const hideToken = useCallback(
    async (token: FT) => {
      try {
        setHideTokenLoading(true)
        setLoadingToken(token)
        await token.hideToken()
        await getUpdatedInitedTokens(tokens)
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

        await token.init(Principal.fromText(publicKey))

        await getUpdatedInitedTokens(tokens)
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
      <div className="w-[210px]">
        <TokenIdentity
          token={token}
          isActive={token.getTokenState() === State.Active}
        />
      </div>
      <div className="text-sm dark:text-white">
        {token.getTokenCategoryFormatted()}
      </div>
      <div className="ml-auto">
        {showTokenLoading || hideTokenLoading ? (
          <Spinner />
        ) : (
          <img
            id={`${token.getTokenName()}_showHideButton`}
            className="cursor-pointer"
            src={
              token.getTokenState() !== State.Active
                ? IconSvgEyeClosed
                : isDarkTheme
                  ? IconSvgEyeShownWhite
                  : IconSvgEyeShown
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
