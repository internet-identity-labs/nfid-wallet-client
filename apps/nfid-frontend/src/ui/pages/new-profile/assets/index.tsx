import clsx from "clsx"
import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { blockchains } from "@nfid/config"

import { useAccountOptions } from "frontend/apps/identity-manager/profile/assets/use-account-options"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { Loader } from "frontend/ui/atoms/loader"
import { AssetFilter, Blockchain } from "frontend/ui/connnector/types"
import { MigrationWarning } from "frontend/ui/molecules/migration-warning"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ProfileAssetsHeader } from "./header"
import Icon from "./transactions.svg"

type Token = {
  toPresentation: (amount?: bigint) => number
  icon: string
  title: string
  currency: string
  balance?: bigint
  price?: string
  blockchain: Blockchain
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
  assetFilter,
  setAssetFilter,
  isLoading,
}) => {
  const [blockchainFilter, setBlockchainFilter] = useState<string[]>([])
  const { options } = useAccountOptions(blockchainFilter)
  const navigate = useNavigate()

  const navigateToTransactions = React.useCallback(
    (blockchain: Blockchain) => () => {
      navigate(`${ProfileConstants.base}/${ProfileConstants.transactions}`, {
        state: {
          blockchain,
        },
      })
    },
    [navigate],
  )

  console.debug("ProfileAssetsPage", { tokens })

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      if (!blockchainFilter.length) return true
      return blockchainFilter.includes(token.blockchain)
    })
  }, [blockchainFilter, tokens])

  const blockchainOptions = React.useMemo(() => {
    return blockchains.map((blockchain) => ({
      label: blockchain,
      value: blockchain,
    }))
  }, [])

  const resetFilters = React.useCallback(() => {
    setBlockchainFilter([])
    setAssetFilter([])
  }, [setAssetFilter])

  return (
    <ProfileTemplate
      pageTitle="Assets"
      icon={Icon}
      iconTooltip="Activity history"
      onIconClick={onIconClick}
      iconId="activity"
      className="overflow-inherit"
    >
      <MigrationWarning />
      <ProfileContainer
        title={
          <ProfileAssetsHeader
            accountsOptions={options}
            assetFilter={assetFilter}
            setAssetFilter={setAssetFilter}
            blockchainOptions={blockchainOptions}
            blockchainFilter={blockchainFilter}
            setBlockchainFilter={setBlockchainFilter}
            resetFilters={resetFilters}
          />
        }
        showChildrenPadding={false}
        className="mb-10 sm:pb-0 "
      >
        <div className="px-5">
          <Loader isLoading={!tokens.length} />
          <table className={clsx("text-left w-full hidden sm:table")}>
            <thead className={clsx("border-b border-black  h-16")}>
              <tr className={clsx("font-bold text-sm leading-5")}>
                <th>Name</th>
                <th>Network</th>
                <th className="text-right">Token balance</th>
                <th className="pr-16 text-right">USD balance</th>
              </tr>
            </thead>
            <tbody className="h-16 text-sm text-[#0B0E13]">
              {filteredTokens.map((token, index) => (
                <tr
                  key={`token_${index}`}
                  id={`token_${token.title.replace(/\s+/g, "")}`}
                  onClick={navigateToTransactions(token.blockchain)}
                  className="border-b border-gray-200 cursor-pointer last:border-b-0 hover:bg-gray-100"
                >
                  <td className="flex items-center h-16">
                    <ApplicationIcon
                      className="mr-[18px]"
                      icon={token.icon}
                      appName={token.title}
                    />
                    <div>
                      <p
                        className="text-sm font-bold"
                        id={`token_${token.title.replace(/\s/g, "")}_currency`}
                      >
                        {token.currency}
                      </p>
                      <p className={"text-[#9CA3AF] text-xs items-left flex"}>
                        {token.title}
                      </p>
                    </div>
                  </td>
                  <td
                    className="text-left"
                    id={`token_${token.title.replace(/\s/g, "")}_blockchain`}
                  >
                    {token.blockchain}
                  </td>
                  <td
                    className="text-sm text-right"
                    id={`token_${token.title.replace(/\s/g, "")}_balance`}
                  >
                    {token.toPresentation(token.balance)} {token.currency}
                  </td>
                  <td
                    className="pr-16 text-sm text-right"
                    id={`token_${token.title.replace(/\s/g, "")}_usd`}
                  >
                    {token.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 sm:hidden">
            {tokens.map((token, index) => (
              <div
                key={`token_${index}`}
                className="flex items-center justify-between h-16"
                onClick={navigateToTransactions(token.blockchain)}
              >
                <div className="flex items-center text-[#0B0E13]">
                  <img
                    src={token.icon}
                    alt="icon"
                    className="w-6 h-6 mr-[13px]"
                  />
                  <div>
                    <p className="text-sm font-bold leading-5">{token.title}</p>
                    <p className="text-[#9CA3AF] text-xs items-left flex leading-3">
                      {token.currency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm leading-5">
                    {token.toPresentation(token.balance)} {token.currency}
                  </div>
                  <div className="text-xs leading-3 text-gray-400">
                    {token.price}
                  </div>
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
