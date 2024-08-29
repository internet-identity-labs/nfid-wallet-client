import clsx from "clsx"
import { useState, HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"

import {
  ApplicationIcon,
  ImageWithFallback,
  IconNftPlaceholder,
  BlurredLoader,
} from "@nfid-frontend/ui"

import AssetDropdown from "./components/asset-dropdown"
import AssetModal from "./components/asset-modal"
import { ProfileAssetsHeader } from "./components/header"

interface ProfileAssetsProps extends HTMLAttributes<HTMLDivElement> {
  activeTokens: FT[]
  filteredTokens: FT[]
  setSearchQuery: (v: string) => void
}

const ProfileAssets: FC<ProfileAssetsProps> = ({
  activeTokens,
  filteredTokens,
  setSearchQuery,
}) => {
  console.log("tokensss", activeTokens, filteredTokens)
  const [isLoading, setIsLoading] = useState(false)
  return (
    <BlurredLoader isLoading={isLoading} overlayClassnames="!rounded-[24px]">
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
          {activeTokens.map((token, index) => (
            <tr
              key={`token_${index}`}
              id={`token_${token.getTokenName().replace(/\s+/g, "")}`}
            >
              <td className="flex items-center h-16">
                <div className="w-[40px] h-[40px] mr-[12px] rounded-full bg-zinc-50">
                  <ImageWithFallback
                    alt="NFID token"
                    className=""
                    fallbackSrc={IconNftPlaceholder}
                    src={`${token.getTokenLogo()}`}
                  />
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  <p
                    className="text-sm font-semibold leading-[25px]"
                    id={`token_${token
                      .getTokenName()
                      .replace(/\s/g, "")}_currency`}
                  >
                    {token.getTokenSymbol()}
                  </p>
                  <p className="text-secondary text-xs leading-[20px]">
                    {token.getTokenName()}
                  </p>
                </div>
              </td>
              <td>{token.getTokenCategory()}</td>
              <td
                className="pr-[10px]"
                id={`token_${token.getTokenName().replace(/\s/g, "")}_balance`}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[150px]">
                  {token.getTokenBalance()}
                </span>
              </td>
              <td
                className="pr-[10px]"
                id={`token_${token.getTokenName().replace(/\s/g, "")}_usd`}
              >
                {/* {token.getUSDBalanceFormatted() ? (
                  token.getUSDBalanceFormatted()
                ) : "Not listed"} */}
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
                  isHideLoading={(value) => setIsLoading(value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AssetModal tokens={null} />
      <div className="sm:hidden">
        {activeTokens.map((token, index) => (
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
                {/* <TickerAmount
                  symbol={token.getTokenSymbol()}
                  value={Number(token.getTokenBalance())}
                  decimals={token.getTokenDecimals()}
                /> */}
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
                isHideLoading={(value) => setIsLoading(value)}
              />
            </div>
          </div>
        ))}
      </div>
    </BlurredLoader>
  )
}

export default ProfileAssets
