import { IOption } from "packages/ui/src/atoms/dropdown-select"
import ExternalIcon from "packages/ui/src/atoms/icons/external.svg"
import HistoryIcon from "packages/ui/src/atoms/icons/history.svg"
import RemoveIcon from "packages/ui/src/atoms/icons/trash.svg"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { Copy, DropdownSelect, IconCmpDots } from "@nfid-frontend/ui"

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
      navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`, {
        state: {
          canisterId,
        },
      })
    },
    [navigate],
  )

  return (
    <>
      <DropdownSelect
        isContextMenu={true}
        triggerElement={<IconCmpDots className="mx-auto" />}
        className="right-[-10px]"
        options={
          ([
            {
              label: "Transactions",
              icon: HistoryIcon,
              value: token.currency,
              handler: navigateToTransactions(token.canisterId || ""),
            },
            {
              element: (
                <Copy
                  iconClassName="w-6"
                  className="h-[100%] flex-1"
                  textClassName="text-black text-sm text-left ml-[10px]"
                  value={token.canisterId || ""}
                  copyTitle="Copy token address"
                />
              ),
              value: "",
            },
            {
              label: "View on block explorer",
              icon: ExternalIcon,
              value: `https://dashboard.internetcomputer.org/canister/${token.canisterId}`,
            },
            {
              label: "Remove token",
              icon: RemoveIcon,
              value: token.canisterId,
              handler: () => {
                if (!token.canisterId) return
                setTokenToRemove({
                  canisterId: token.canisterId,
                  name: token.title,
                })
              },
            },
          ] as IOption[]) ?? []
        }
        selectedValues={[]}
        setSelectedValues={() => false}
        isMultiselect={false}
      />
    </>
  )
}

export default TokenDropdown
