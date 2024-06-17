import clsx from "clsx"
import React, { useState } from "react"

import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { Loader } from "frontend/ui/atoms/loader"
import { AssetFilter, Blockchain } from "frontend/ui/connnector/types"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import AssetDropdown from "./asset-dropdown"
import AssetModal from "./asset-modal"
import { ProfileAssetsHeader } from "./header"
import Icon from "./transactions.svg"

export type Token = {
  toPresentation: (amount: bigint, decimals: number) => number | string
  icon: string
  title: string
  currency: string
  balance?: bigint
  price?: string
  blockchain: Blockchain
  decimals?: number
  canisterId?: string
}

export type TokenToRemove = {
  canisterId: string
  name: string
}

interface IProfileAssetsPage extends React.HTMLAttributes<HTMLDivElement> {
  onIconClick: () => void
  tokens: Token[]
  assetFilter: AssetFilter[]
  setAssetFilter: (value: AssetFilter[]) => void
  isLoading?: boolean
}

const ProfileAssetsPage: React.FC<IProfileAssetsPage> = ({
  onIconClick,
  tokens,
  isLoading,
}) => {
  const [tokenToRemove, setTokenToRemove] = useState<TokenToRemove | null>(null)

  console.debug("ProfileAssetsPage", { tokens })

  return (
    <ProfileTemplate
      pageTitle="Assets"
      icon={Icon}
      iconTooltip="Activity history"
      onIconClick={onIconClick}
      iconId="activity"
      className="overflow-inherit"
    >
      <ProfileContainer
        title={<ProfileAssetsHeader />}
        className="mb-10 sm:pb-0 "
        innerClassName="!px-0 sm:!px-0"
      >
        <div className="px-5">
          <Loader isLoading={!tokens.length} />
          <table className={clsx("text-left w-full hidden sm:table")}>
            <thead className={clsx("border-b border-black  h-16")}>
              <tr className={clsx("font-bold text-sm leading-5")}>
                <th>Name</th>
                <th className="text-right">Token balance</th>
                <th className="text-right pr-[22px]">USD balance</th>
                <th className="px-[10px] w-[44px]"></th>
              </tr>
            </thead>
            <tbody className="h-16 text-sm text-[#0B0E13]">
              {tokens.map((token, index) => (
                <tr
                  key={`token_${index}`}
                  id={`token_${token.title.replace(/\s+/g, "")}`}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="flex items-center h-16">
                    <ApplicationIcon
                      className="mr-[18px]"
                      icon={token.icon}
                      appName={token.title}
                    />
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <p
                        className="text-sm font-bold w-[150px]"
                        id={`token_${token.title.replace(/\s/g, "")}_currency`}
                      >
                        {token.currency}
                      </p>
                      <p
                        className={
                          "text-[#9CA3AF] text-xs items-left flex w-[150px]"
                        }
                      >
                        {token.title}
                      </p>
                    </div>
                  </td>
                  <td
                    className="text-sm text-right"
                    id={`token_${token.title.replace(/\s/g, "")}_balance`}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[150px]">
                      {`${token.toPresentation(
                        token.balance!,
                        token.decimals!,
                      )} ${token.currency}`}
                    </span>
                  </td>
                  <td
                    className="text-sm text-right pr-[20px]"
                    id={`token_${token.title.replace(/\s/g, "")}_usd`}
                  >
                    {token.price !== undefined
                      ? `${token.price}`
                      : "Not listed"}
                  </td>
                  <td className="px-[10px] text-sm text-right">
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
                    icon={token.icon}
                    appName={token.title}
                  />
                  <p className="text-black text-sm items-left flex leading-5">
                    {token.currency}
                  </p>
                </div>
                <div className="text-right ml-auto mr-[20px]">
                  <div className="text-sm leading-5 text-ellipsis whitespace-nowrap overflow-hidden w-[70px]">
                    {`${token.toPresentation(
                      token.balance!,
                      token.decimals!,
                    )} ${token.currency}`}
                  </div>
                  <div className="text-xs leading-3 text-gray-400">
                    {token.price !== undefined
                      ? `${token.price} USD`
                      : "Not listed"}
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
          {tokens?.length && isLoading ? (
            <div className="flex items-center justify-center w-full h-16 border-t border-gray-200">
              <Loader
                isLoading={true}
                fullscreen={false}
                imageClasses="w-10 h-10"
              />
            </div>
          ) : null}
        </div>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileAssetsPage
