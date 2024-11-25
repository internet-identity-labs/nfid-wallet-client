import { useCallback, FC } from "react"
import { useNavigate } from "react-router-dom"
import useSWR, { mutate } from "swr"

import {
  Dropdown,
  DropdownOption,
  IconCmpDots,
  IconSvgArrow,
  IconSvgEyeClosedBlack,
  IconSvgHistoryIcon,
  IconSvgTokenInfo,
  IDropdownPosition,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"

import { IProfileConstants } from ".."
import { fetchAllTokens, removeToken } from "../utils"

type AssetDropdownProps = {
  token: FT
  tokens: FT[]
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
  setToken: (value: FT) => void
  dropdownPosition: IDropdownPosition
}

export const AssetDropdown: FC<AssetDropdownProps> = ({
  token,
  tokens,
  profileConstants,
  onSendClick,
  setToken,
  dropdownPosition,
}) => {
  const navigate = useNavigate()
  const navigateToTransactions = useCallback(
    (canisterId: string) => () => {
      navigate(`${profileConstants.base}/${profileConstants.activity}`, {
        state: {
          canisterId,
        },
      })
    },
    [navigate],
  )

  const { data: allTokens = [] } = useSWR("allTokens", fetchAllTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  if (!token.getTokenAddress()) return null

  return (
    <>
      <Dropdown
        position={dropdownPosition}
        className="!rounded-[12px]"
        triggerElement={
          <IconCmpDots className="mx-auto transition-all cursor-pointer text-secondary hover:text-black" />
        }
      >
        <DropdownOption
          label="Send"
          icon={IconSvgArrow}
          iconClassName="rotate-[135deg]"
          handler={() => onSendClick(token.getTokenAddress())}
        />
        <DropdownOption
          label="Token information"
          icon={IconSvgTokenInfo}
          handler={() => setToken(token)}
        />
        <DropdownOption
          label="Transactions"
          icon={IconSvgHistoryIcon}
          handler={navigateToTransactions(token.getTokenAddress())}
        />

        {token.isHideable() && (
          <DropdownOption
            label="Hide token"
            icon={IconSvgEyeClosedBlack}
            handler={() => {
              token.hideToken()
              const result = removeToken(token, tokens, allTokens)
              if (!result) return

              const { updatedAllTokens, updatedActiveTokens } = result
              mutate("activeTokens", updatedActiveTokens, false)
              mutate("allTokens", updatedAllTokens, false)
            }}
          />
        )}
      </Dropdown>
    </>
  )
}
