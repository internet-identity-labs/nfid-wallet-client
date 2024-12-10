import { HTMLAttributes, FC, useState } from "react"
import { FT } from "src/integration/ft/ft"

import { TableTokenSkeleton } from "../../atoms/skeleton"
import { getIsMobileDeviceMatch } from "../../utils/is-mobile"
import { ActiveToken } from "./components/active-asset"
import { TokensHeader } from "./components/header"
import { NewAssetsModal } from "./components/new-assets-modal"
import { TokenInfoModal } from "./components/token-info-modal"

export interface IProfileConstants {
  base: string
  activity: string
}

export interface TokensProps extends HTMLAttributes<HTMLDivElement> {
  activeTokens: FT[]
  filteredTokens: FT[]
  isTokensLoading: boolean
  profileConstants: IProfileConstants
  onSubmitIcrc1Pair: (ledgerID: string, indexID: string) => Promise<void>
  onFetch: (
    ledgerID: string,
    indexID: string,
  ) => Promise<{
    name: string
    symbol: string
    logo: string | undefined
    decimals: number
    fee: bigint
  }>
  onSendClick: (value: string) => void
  onTokensUpdate: () => void
}

export const Tokens: FC<TokensProps> = ({
  activeTokens,
  filteredTokens,
  isTokensLoading,
  profileConstants,
  onSubmitIcrc1Pair,
  onFetch,
  onSendClick,
  onTokensUpdate,
}) => {
  const [token, setToken] = useState<FT | undefined>()

  return (
    <>
      <TokensHeader
        tokens={filteredTokens}
        onSubmitIcrc1Pair={onSubmitIcrc1Pair}
        onFetch={onFetch}
        onTokensUpdate={onTokensUpdate}
      />
      <table className="w-full text-left">
        <thead className="text-secondary h-[40px] hidden md:table-header-group">
          <tr className="text-sm font-bold leading-5">
            <th className="w-[25%] min-w-[100px] pr-[30px]">Name</th>
            <th className="w-[25%] pr-[10px] min-w-[100px]">Category</th>
            <th className="w-[25%] pr-[10px] min-w-[100px]">Token balance</th>
            <th className="w-[25%] pr-[10px] min-w-[100px]">USD balance</th>
            <th className="w-[24px]"></th>
          </tr>
        </thead>
        <tbody className="h-16 text-sm text-black">
          {isTokensLoading ? (
            <TableTokenSkeleton
              tableRowsAmount={5}
              tableCellAmount={getIsMobileDeviceMatch() ? 2 : 4}
            />
          ) : (
            activeTokens.map((token, index, arr) => (
              <ActiveToken
                key={`token_${token.getTokenAddress()}_${token.getTokenState()}`}
                token={token}
                tokens={filteredTokens}
                profileConstants={profileConstants}
                onSendClick={onSendClick}
                setToken={setToken}
                dropdownPosition={index + 4 > arr.length ? "top" : "bottom"}
                onTokensUpdate={onTokensUpdate}
              />
            ))
          )}
        </tbody>
      </table>
      <NewAssetsModal tokens={null} />
      <TokenInfoModal token={token} onClose={() => setToken(undefined)} />
    </>
  )
}
