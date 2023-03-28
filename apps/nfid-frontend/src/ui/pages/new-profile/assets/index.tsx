import clsx from "clsx"
import React, { useMemo, useState } from "react"
import { generatePath, useNavigate } from "react-router-dom"

<<<<<<< HEAD
import { Image } from "@nfid-frontend/ui"
=======
import { blockchains } from "@nfid/config"
>>>>>>> fe92fb26c (feat([sc-6069]): blockchains constant)

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import ArrowRight from "./arrow-right.svg"
import { ProfileAssetsHeader } from "./header"
import { ProfileAssetsNFT } from "./nft"
import Icon from "./transactions.svg"

type Token = {
  toPresentation: (amount?: bigint) => number
  icon: string
  title: string
  currency: string
  balance?: bigint
  price?: string
  blockchain: string
}

interface IProfileAssetsPage extends React.HTMLAttributes<HTMLDivElement> {
  onIconClick: () => void
  tokens: Token[]
  nfts?: UserNFTDetails[]
}

const ProfileAssetsPage: React.FC<IProfileAssetsPage> = ({
  onIconClick,
  tokens,
  nfts,
}) => {
  const [blockchainFilter, setBlockchainFilter] = useState<string[]>([])
  const navigate = useNavigate()
  const handleNavigateToTokenDetails = React.useCallback(
    (token: string) => () => {
      navigate(
        generatePath(`${ProfileConstants.base}/${ProfileConstants.wallet}`, {
          token,
        }),
      )
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
  }, [])

  return (
    <ProfileTemplate
      pageTitle="Assets"
      icon={Icon}
      iconTooltip="Transactions history"
      onIconClick={onIconClick}
      className="overflow-inherit"
    >
      <ProfileContainer
        title={
          <ProfileAssetsHeader
            blockchainOptions={blockchainOptions}
            blockchainFilter={blockchainFilter}
            setBlockchainFilter={setBlockchainFilter}
            resetFilters={resetFilters}
          />
        }
        showChildrenPadding={false}
        className="sm:pb-0"
      >
        <div className="px-5">
          <Loader isLoading={!tokens.length} />
          <table className={clsx("text-left w-full hidden sm:table")}>
            <thead className={clsx("border-b border-black  h-16")}>
              <tr className={clsx("font-bold text-sm leading-5")}>
                <th>Name</th>
                <th>Blockchain</th>
                <th>Token balance</th>
                <th className="pr-5 sm:pr-[30px]">USD balance</th>
              </tr>
            </thead>
            <tbody className="h-16 text-sm text-[#0B0E13]">
              {filteredTokens.map((token, index) => (
                <tr
                  key={`token_${index}`}
                  id={`token_${token.title.replace(/\s/g, "")}`}
                  onClick={handleNavigateToTokenDetails(token.currency)}
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
                        id={`token_${token.title}_currency`}
                      >
                        {token.currency}
                      </p>
                      <p className={"text-[#9CA3AF] text-xs items-left flex"}>
                        {token.title}
                      </p>
                    </div>
                  </td>
                  <td id={`token_${token.title}_blockchain`}>
                    {token.blockchain}
                  </td>
                  <td
                    className="text-sm"
                    id={`token_${token.title.replace(/\s/g, "")}_balance`}
                  >
<<<<<<< HEAD
                    {token.blockchainName}
                  </td>
                  <td
                    className="text-sm"
                    id={`token_${token.title.replace(/\s/g, "")}_balance`}
                  >
=======
>>>>>>> fe92fb26c (feat([sc-6069]): blockchains constant)
                    {token.toPresentation(token.balance)} {token.currency}
                  </td>
                  <td
                    className="text-sm"
                    id={`token_${token.title.replace(/\s/g, "")}_usd`}
                  >
                    {token.price}
                  </td>
                  <td>
                    <Image src={ArrowRight} alt="arrow right" />
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
                onClick={handleNavigateToTokenDetails(token.currency)}
              >
                <div className="flex items-center text-[#0B0E13]">
                  <Image
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
        </div>
      </ProfileContainer>
      <ProfileAssetsNFT nfts={nfts} />
    </ProfileTemplate>
  )
}

export default ProfileAssetsPage
