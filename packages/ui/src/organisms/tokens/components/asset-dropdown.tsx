import { useCallback, FC } from "react"
import { useNavigate } from "react-router-dom"

import {
  Dropdown,
  DropdownOption,
  IconCmpDots,
  IconSvgArrow,
  IconSvgSwapAction,
  IconSvgSwapActionWhite,
  IconSvgEyeClosedBlack,
  IconSvgEyeClosedWhite,
  IconSvgHistoryIcon,
  IconSvgHistoryWhiteIcon,
  IconSvgTokenInfo,
  IconSvgTokenInfoWhite,
  IDropdownPosition,
  IconSvgConvertAction,
  IconSvgConvertActionWhite,
  IconSvgStakeAction,
  IconSvgStakeActionWhite,
  IconSvgArrowWhite,
} from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  ICP_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category, ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import { useDarkTheme } from "frontend/hooks"
import { FT } from "frontend/integration/ft/ft"

import { IProfileConstants } from ".."
import { getUpdatedInitedTokens } from "frontend/features/transfer-modal/utils"

type AssetDropdownProps = {
  token: FT
  tokens: FT[]
  profileConstants: IProfileConstants
  onSendClick: (value: string) => void
  onSwapClick: (value: string) => void
  onConvertToBtc: () => void
  onConvertToCkBtc: () => void
  onConvertToEth: () => void
  onConvertToCkEth: () => void
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
  onConvertToEth,
  onConvertToCkEth,
  onStakeClick,
  setToken,
  dropdownPosition,
  setIsTokenProcessed,
  isTokenProcessed,
}) => {
  const isDarkTheme = useDarkTheme()
  const navigate = useNavigate()
  const navigateToTransactions = useCallback(
    (canisterId: string) => () => {
      navigate(`${profileConstants.base}/${profileConstants.activity}`, {
        state: {
          canisterId,
        },
      })
    },
    [navigate, profileConstants.base, profileConstants.activity],
  )

  if (!token.getTokenAddress()) return null

  return (
    <>
      <Dropdown
        position={dropdownPosition}
        className={"!rounded-[12px]"}
        triggerElement={
          <IconCmpDots className="mx-auto transition-all cursor-pointer text-secondary hover:text-black dark:text-zinc-400 dark:hover:text-white" />
        }
        isDisabled={isTokenProcessed}
      >
        <DropdownOption
          label="Send"
          icon={isDarkTheme ? IconSvgArrowWhite : IconSvgArrow}
          iconClassName="rotate-[135deg] dark:text-white"
          handler={() => onSendClick(token.getTokenAddress())}
        />
        {token.getChainId() === ChainId.ICP && (
          <DropdownOption
            label="Swap"
            icon={isDarkTheme ? IconSvgSwapActionWhite : IconSvgSwapAction}
            handler={() => onSwapClick(token.getTokenAddress())}
          />
        )}
        {token.getTokenAddress() === CKBTC_CANISTER_ID && (
          <DropdownOption
            label="Convert"
            icon={
              isDarkTheme ? IconSvgConvertActionWhite : IconSvgConvertAction
            }
            handler={onConvertToBtc}
          />
        )}
        {token.getTokenAddress() === BTC_NATIVE_ID && (
          <DropdownOption
            label="Convert"
            icon={
              isDarkTheme ? IconSvgConvertActionWhite : IconSvgConvertAction
            }
            handler={onConvertToCkBtc}
          />
        )}
        {token.getTokenAddress() === ETH_NATIVE_ID && (
          <DropdownOption
            label="Convert"
            icon={
              isDarkTheme ? IconSvgConvertActionWhite : IconSvgConvertAction
            }
            handler={onConvertToCkEth}
          />
        )}
        {token.getTokenAddress() === CKETH_LEDGER_CANISTER_ID && (
          <DropdownOption
            label="Convert"
            icon={
              isDarkTheme ? IconSvgConvertActionWhite : IconSvgConvertAction
            }
            handler={onConvertToEth}
          />
        )}
        {(token.getTokenCategory() === Category.Sns ||
          token.getTokenAddress() === ICP_CANISTER_ID) && (
          <DropdownOption
            label="Stake"
            icon={isDarkTheme ? IconSvgStakeActionWhite : IconSvgStakeAction}
            handler={() => onStakeClick(token.getTokenAddress())}
          />
        )}
        <DropdownOption
          label="Token information"
          icon={isDarkTheme ? IconSvgTokenInfoWhite : IconSvgTokenInfo}
          handler={() => setToken(token)}
        />
        <DropdownOption
          label="Transactions"
          icon={isDarkTheme ? IconSvgHistoryWhiteIcon : IconSvgHistoryIcon}
          handler={navigateToTransactions(token.getTokenAddress())}
        />
        {token.isHideable() && (
          <DropdownOption
            label="Hide token"
            icon={isDarkTheme ? IconSvgEyeClosedWhite : IconSvgEyeClosedBlack}
            handler={async () => {
              setIsTokenProcessed(true)
              await token.hideToken()
              await getUpdatedInitedTokens(tokens)
              setIsTokenProcessed(false)
            }}
          />
        )}
      </Dropdown>
    </>
  )
}
