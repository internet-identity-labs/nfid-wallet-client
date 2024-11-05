import { useCallback, FC } from "react"
import { useNavigate } from "react-router-dom"
import { mutate } from "swr"

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

type AssetDropdownProps = {
  token: FT
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
  setToken: (value: FT) => void
  dropdownPosition: IDropdownPosition
}

export const AssetDropdown: FC<AssetDropdownProps> = ({
  token,
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
            handler={async () => {
              await token.hideToken()
              mutate("activeTokens")
            }}
          />
        )}
      </Dropdown>
    </>
  )
}
