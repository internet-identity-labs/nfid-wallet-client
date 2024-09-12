import { HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"

import { getIsMobileDeviceMatch } from "frontend/integration/device"

import { TableTokenSkeleton } from "../../atoms/skeleton"
import { ActiveToken } from "./components/active-asset"
import { TokensHeader } from "./components/header"
import { NewAssetsModal } from "./components/new-assets-modal"

export interface IProfileConstants {
  base: string
  activity: string
}

export interface TokensProps extends HTMLAttributes<HTMLDivElement> {
  activeTokens: FT[]
  filteredTokens: FT[]
  isActiveTokensLoading: boolean
  setSearchQuery: (v: string) => void
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
}

export const Tokens: FC<TokensProps> = ({
  activeTokens,
  filteredTokens,
  isActiveTokensLoading,
  setSearchQuery,
  profileConstants,
  onSubmitIcrc1Pair,
  onFetch,
}) => {
  return (
    <>
      <TokensHeader
        tokens={filteredTokens}
        setSearch={(value) => setSearchQuery(value)}
        onSubmitIcrc1Pair={onSubmitIcrc1Pair}
        onFetch={onFetch}
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
          {isActiveTokensLoading ? (
            <TableTokenSkeleton
              tableRowsAmount={5}
              tableCellAmount={getIsMobileDeviceMatch() ? 2 : 4}
              className="bg-skeletonColor"
            />
          ) : (
            activeTokens.map((token) => (
              <ActiveToken
                key={`token_${token.getTokenName()}`}
                token={token}
                profileConstants={profileConstants}
              />
            ))
          )}
        </tbody>
      </table>
      <NewAssetsModal tokens={null} />
    </>
  )
}
