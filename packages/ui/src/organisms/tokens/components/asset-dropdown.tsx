import ExternalIcon from "packages/ui/src/atoms/icons/external.svg"
import HistoryIcon from "packages/ui/src/atoms/icons/history.svg"
import RemoveIcon from "packages/ui/src/atoms/icons/trash.svg"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { Copy, Dropdown, DropdownOption, IconCmpDots } from "@nfid-frontend/ui"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { FT } from "frontend/integration/ft/ft"

import { TokenToRemove } from ".."

type ITokenDropdown = {
  option?: string
  token: ICRC1
  setTokenToRemove: (v: TokenToRemove) => void
}

const TokenDropdown: React.FC<ITokenDropdown> = ({
  token,
  setTokenToRemove,
}) => {
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

  //if (!token.) return null

  return (
    <>
      <Dropdown
        triggerElement={
          <IconCmpDots className="mx-auto transition-all cursor-pointer text-secondary hover:text-black" />
        }
      >
        <DropdownOption
          label="Transactions"
          icon={HistoryIcon}
          handler={navigateToTransactions("")}
        />
        <DropdownOption
          element={
            <Copy
              iconClassName="!w-6"
              className="h-[100%] flex-1 !text-black hover:!opacity-100"
              iconSize="!w-6"
              titleClassName="!ml-[12px] !text-black !text-sm text-left !font-normal"
              value={""}
              copyTitle="Copy token address"
            />
          }
        />
        <DropdownOption
          label="View on block explorer"
          icon={ExternalIcon}
          handler={() => {
            window.open("", "_blank")
          }}
        />
        {/* {token.getTokenAddress() !== ICP_CANISTER_ID && (
          <DropdownOption
            label="Remove token"
            icon={RemoveIcon}
            handler={() => {
              if (!token.getTokenAddress()) return
              setTokenToRemove({
                canisterId: token.getTokenAddress(),
                name: token.getTokenName(),
              })
            }}
          />
        )} */}
      </Dropdown>
    </>
  )
}

export default TokenDropdown
