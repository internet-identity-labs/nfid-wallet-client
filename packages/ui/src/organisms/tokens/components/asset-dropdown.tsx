import ExternalIcon from "packages/ui/src/atoms/icons/external.svg"
import HistoryIcon from "packages/ui/src/atoms/icons/history.svg"
import { useCallback, FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import { mutate } from "swr"

import {
  Copy,
  Dropdown,
  DropdownOption,
  IconCmpDots,
  IconSvgEyeClosedBlack,
} from "@nfid-frontend/ui"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { FT } from "frontend/integration/ft/ft"

type ITokenDropdown = {
  option?: string
  token: FT
  isHideLoading: (value: boolean) => void
}

const TokenDropdown: FC<ITokenDropdown> = ({ token, isHideLoading }) => {
  const navigate = useNavigate()
  const navigateToTransactions = useCallback(
    (canisterId: string) => () => {
      navigate(`${ProfileConstants.base}/${ProfileConstants.activity}`, {
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
          label="Transactions"
          icon={HistoryIcon}
          handler={navigateToTransactions(token.getTokenAddress())}
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
        {token.getTokenAddress() !== ICP_CANISTER_ID && (
          <DropdownOption
            label="Hide token"
            icon={IconSvgEyeClosedBlack}
            handler={async () => {
              isHideLoading(true)
              await token.hideToken()
              mutate("activeTokens")
              isHideLoading(false)
            }}
          />
        )}
        <DropdownOption
          label="View on block explorer"
          icon={ExternalIcon}
          handler={() => {
            window.open(token.getBlockExplorerLink(), "_blank")
          }}
        />
      </Dropdown>
    </>
  )
}

export default TokenDropdown
