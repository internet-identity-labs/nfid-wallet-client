import { useCallback, FC } from "react"
import { useNavigate } from "react-router-dom"

import {
  Dropdown,
  DropdownOption,
  IconCmpDots,
  IconSvgArrow,
  IconSvgSwapAction,
  IconSvgEyeClosedBlack,
  IconSvgHistoryIcon,
  IconSvgTokenInfo,
  IDropdownPosition,
  IconSvgConvertAction,
  IconSvgStakeAction,
} from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { mutateWithTimestamp } from "@nfid/swr"

import { FT } from "frontend/integration/ft/ft"

import { IProfileConstants } from ".."

type AssetDropdownProps = {
  token: FT
  tokens: FT[]
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
  onSwapClick: (value: string) => void
  onConvertToBtc: () => void
  onConvertToCkBtc: () => void
  onStakeClick: (value: string) => void
  setToken: (value: FT) => void
  dropdownPosition: IDropdownPosition
  setIsTokenProcessed: (value: boolean) => void
  isTokenProcessed: boolean
}

export const AssetDropdown: FC<AssetDropdownProps> = ({
  token,
  tokens,
  profileConstants,
  onSendClick,
  onSwapClick,
  onConvertToBtc,
  onConvertToCkBtc,
  onStakeClick,
  setToken,
  dropdownPosition,
  setIsTokenProcessed,
  isTokenProcessed,
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
        className={"!rounded-[12px]"}
        triggerElement={
          <IconCmpDots className="mx-auto transition-all cursor-pointer text-secondary hover:text-black" />
        }
        isDisabled={isTokenProcessed}
      >
        <DropdownOption
          label="Send"
          icon={IconSvgArrow}
          iconClassName="rotate-[135deg]"
          handler={() => onSendClick(token.getTokenAddress())}
        />
        {token.getTokenAddress() !== BTC_NATIVE_ID ? (
          <DropdownOption
            label="Swap"
            icon={IconSvgSwapAction}
            handler={() => onSwapClick(token.getTokenAddress())}
          />
        ) : (
          <DropdownOption
            label="Convert"
            icon={IconSvgConvertAction}
            handler={onConvertToCkBtc}
          />
        )}
        {token.getTokenAddress() === CKBTC_CANISTER_ID && (
          <DropdownOption
            label="Convert"
            icon={IconSvgConvertAction}
            handler={onConvertToBtc}
          />
        )}
        {(token.getTokenCategory() === Category.Sns ||
          token.getTokenAddress() === ICP_CANISTER_ID) && (
          <DropdownOption
            label="Stake"
            icon={IconSvgStakeAction}
            handler={() => onStakeClick(token.getTokenAddress())}
          />
        )}
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
              setIsTokenProcessed(true)
              await token.hideToken()

              const updatedTokens = [...tokens]

              await mutateWithTimestamp("tokens", updatedTokens, false)
              setIsTokenProcessed(false)
            }}
          />
        )}
      </Dropdown>
    </>
  )
}
