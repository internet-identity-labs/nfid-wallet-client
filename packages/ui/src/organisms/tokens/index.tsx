import clsx from "clsx"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import { useState, HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"
import useSWR from "swr"

import { Loader, ApplicationIcon } from "@nfid-frontend/ui"
import { icrc1Service } from "@nfid/integration/token/icrc1/icrc1-service"
import { ICRC1 } from "@nfid/integration/token/icrc1/types"

import AssetDropdown from "./components/asset-dropdown"
import AssetModal from "./components/asset-modal"
import { ProfileAssetsHeader } from "./components/header"

export type TokenToRemove = {
  canisterId: string
  name: string
}

interface ProfileAssetsProps extends HTMLAttributes<HTMLDivElement> {
  tokens: ICRC1[]
  filteredTokens: ICRC1[]
  activeTokens: ICRC1[]
  setSearchQuery: (v: string) => void
}

const ProfileAssets: FC<ProfileAssetsProps> = ({
  tokens,
  filteredTokens,
  activeTokens,
  setSearchQuery,
}) => {
  const [tokenToRemove, setTokenToRemove] = useState<TokenToRemove | null>(null)

  console.log("123123", tokens, activeTokens, filteredTokens)

  return (
    <div>
      <ProfileAssetsHeader
        tokens={filteredTokens}
        setSearch={(value) => setSearchQuery(value)}
      />
      <table className={clsx("text-left w-full hidden sm:table")}>
        <thead className={clsx("text-secondary h-[40px]")}>
          <tr className={clsx("font-bold text-sm leading-5")}>
            <th>Name</th>
            <th className="w-[230px] pr-[10px]">Category</th>
            <th className="w-[230px] pr-[10px]">Token balance</th>
            <th className="w-[186px] pr-[10px]">USD balance</th>
            <th className="w-[24px]"></th>
          </tr>
        </thead>
        <tbody className="h-16 text-sm text-black">
          {tokens.map((token, index) => (
            <tr
              key={`token_${index}`}
              id={`token_${token.name.replace(/\s+/g, "")}`}
            >
              <td className="flex items-center h-16">
                <ApplicationIcon
                  className="mr-[12px]"
                  icon={"icon"}
                  appName={token.name}
                />
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  <p
                    className="text-sm font-semibold leading-[25px]"
                    id={`token_${token.name
                      .replace(/\s/g, "")}_currency`}
                  >
                    {token.symbol}
                  </p>
                  <p className="text-secondary text-xs leading-[20px]">
                    {token.symbol}
                  </p>
                </div>
              </td>
              <td>{token.category}</td>
              <td
                className="pr-[10px]"
                id={`token_${token.name.replace(/\s/g, "")}_balance`}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[150px]">
                  <TickerAmount
                    symbol={token.symbol}
                    value={Number(token.)}
                    decimals={token.getTokenDecimals()}
                  />
                </span>
              </td>
              <td
                className="pr-[10px]"
                id={`token_${token.getTokenName().replace(/\s/g, "")}_usd`}
              >
                {/* {token.rate !== undefined ? (
                  <TickerAmount
                    symbol={token.currency}
                    value={Number(token.getTokenBalance())}
                    decimals={token.decimals}
                    usdRate={token.rate}
                  />
                ) : (
                  "Not listed"
                )} */}
                Not listed
              </td>
              <td>
                <AssetDropdown
                  token={token}
                  setTokenToRemove={(value) => setTokenToRemove(value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AssetModal
        token={tokenToRemove}
        setTokenToRemove={(value) => setTokenToRemove(value)}
      />
      <div className="sm:hidden">
        {tokens.map((token, index) => (
          <div
            key={`token_${index}`}
            className="flex items-center justify-between h-16 border-b border-gray-200 last:border-b-0 pr-[8px]"
          >
            <div className="flex items-center text-[#0B0E13]">
              <ApplicationIcon
                className="w-6 h-6 mr-[13px]"
                icon={token.getTokenLogo()}
                appName={token.getTokenName()}
              />
              <p className="flex text-sm leading-5 text-black items-left">
                {token.getTokenSymbol()}
              </p>
            </div>
            <div className="text-right ml-auto mr-[20px]">
              <div className="text-sm leading-5">
                <TickerAmount
                  symbol={token.getTokenSymbol()}
                  value={Number(token.getTokenBalance())}
                  decimals={token.getTokenDecimals()}
                />
              </div>
              <div className="text-xs leading-3 text-gray-400">
                {/* {token.rate !== undefined ? (
                  <TickerAmount
                    symbol={token.currency}
                    value={Number(token.getTokenBalance())}
                    decimals={token.decimals}
                    usdRate={token.rate}
                  />
                ) : (
                  "Not listed"
                )} */}
                Not listed
              </div>
            </div>
            <div className="w-auto">
              <AssetDropdown
                token={token}
                setTokenToRemove={(value) => setTokenToRemove(value)}
              />
            </div>
          </div>
        ))}
      </div>
      {/* {tokens?.length && isLoading ? (
        <div className="flex items-center justify-center w-full h-16 border-t border-gray-200">
          <Loader
            isLoading={true}
            fullscreen={false}
            imageClasses="w-10 h-10"
          />
        </div>
      ) : null} */}
    </div>
  )
}

export default ProfileAssets
