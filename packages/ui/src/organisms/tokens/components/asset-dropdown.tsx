import { useCallback, FC } from "react"
import { useNavigate } from "react-router-dom"
import { mutate } from "swr"

import {
  Copy,
  Dropdown,
  DropdownOption,
  IconCmpDots,
  IconSvgArrow,
  IconSvgExternalIcon,
  IconSvgEyeClosedBlack,
  IconSvgHistoryIcon,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"

import { IProfileConstants } from ".."

type AssetDropdownProps = {
  token: FT
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
}

export const AssetDropdown: FC<AssetDropdownProps> = ({
  token,
  profileConstants,
  onSendClick,
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
          element={
            <Copy
              iconClassName="!w-6"
              className="h-[100%] flex-1 !text-black hover:!opacity-100"
              iconSize="!w-6"
              titleClassName="!ml-[12px] !text-black !text-sm text-left !font-normal"
              value={token.getTokenAddress()}
              copyTitle="Copy token address"
            />
          }
        />
        <DropdownOption
          label="View on block explorer"
          icon={IconSvgExternalIcon}
          handler={() => {
            window.open(token.getBlockExplorerLink(), "_blank")
          }}
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
