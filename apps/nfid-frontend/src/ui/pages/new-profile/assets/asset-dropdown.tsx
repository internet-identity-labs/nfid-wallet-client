import ExternalIcon from "packages/ui/src/atoms/icons/external.svg"
import HistoryIcon from "packages/ui/src/atoms/icons/history.svg"
import RemoveIcon from "packages/ui/src/atoms/icons/trash.svg"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { Copy, Dropdown, DropdownOption, IconCmpDots } from "@nfid-frontend/ui"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

import { Token, TokenToRemove } from "."

type ITokenDropdown = {
  option?: string
  token: Token
  setTokenToRemove: (v: TokenToRemove) => void
}

const TokenDropdown: React.FC<ITokenDropdown> = ({
  token,
  setTokenToRemove,
}) => {
  const navigate = useNavigate()
  const navigateToTransactions = useCallback(
    (canisterId: string) => () => {
      navigate(ProfileConstants.transactions, {
        state: {
          canisterId,
        },
      })
    },
    [navigate],
  )

  if (!token.canisterId) return null

  return (
    <>
      <Dropdown
        triggerElement={
          <IconCmpDots className="mx-auto cursor-pointer hover:opacity-60 transition-all" />
        }
      >
        <DropdownOption
          label="Transactions"
          icon={HistoryIcon}
          handler={navigateToTransactions(token.canisterId)}
        />
        <DropdownOption
          element={
            <Copy
              iconClassName="!w-6"
              className="h-[100%] flex-1 !text-black hover:!opacity-100"
              iconSize="!w-6"
              titleClassName="!ml-[12px] !text-black !text-sm text-left !font-normal"
              value={token.canisterId}
              copyTitle="Copy token address"
            />
          }
        />
        <DropdownOption
          label="View on block explorer"
          icon={ExternalIcon}
          handler={() => {
            window.open(
              `https://dashboard.internetcomputer.org/canister/${token.canisterId}`,
              "_blank",
            )
          }}
        />
        {token.canisterId !== ICP_CANISTER_ID && (
          <DropdownOption
            label="Remove token"
            icon={RemoveIcon}
            handler={() => {
              if (!token.canisterId) return
              setTokenToRemove({
                canisterId: token.canisterId,
                name: token.title,
              })
            }}
          />
        )}
      </Dropdown>
    </>
  )
}

export default TokenDropdown
