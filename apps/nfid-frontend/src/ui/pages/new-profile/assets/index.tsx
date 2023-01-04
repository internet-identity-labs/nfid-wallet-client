import clsx from "clsx"
import React from "react"
import { generatePath, useNavigate } from "react-router-dom"

import { IconCmpInfo, Tooltip } from "@nfid-frontend/ui"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ProfileAssetsNFT } from "./nft"
import Icon from "./transactions.svg"

type Token = {
  toPresentation: (amount?: bigint) => number
  icon: string
  title: string
  currency: string
  balance?: bigint
  price?: string
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
          <>
            <p>Your tokens</p>
            <Tooltip
              tip={
                <div className="w-60">
                  Transaction history for some assets, like XTC, are not
                  supported due to a lack of support from Fleek.
                </div>
              }
            >
              <IconCmpInfo className="cursor-pointer" />
            </Tooltip>
          </>
        }
        showChildrenPadding={false}
      >
        <Loader isLoading={!tokens.length} />
        <table className={clsx("text-left w-full hidden sm:table")}>
          <thead className={clsx("border-b border-black-base h-16")}>
            <tr className={clsx("font-bold text-sm leading-5")}>
              <th className="pl-5 sm:pl-[30px]">Name</th>
              <th>Token balance</th>
              <th className="pr-5 sm:pr-[30px]">USD balance</th>
            </tr>
          </thead>
          <tbody className="h-16 text-sm text-[#0B0E13]">
            {tokens.map((token, index) => (
              <tr
                key={`token_${index}`}
                onClick={handleNavigateToTokenDetails(token.currency)}
                className="border-b border-gray-200 cursor-pointer hover:bg-gray-100"
              >
                <td className="flex items-center h-16 pl-5 sm:pl-[30px]">
                  <ApplicationIcon
                    className="mr-[18px]"
                    icon={token.icon}
                    appName={token.title}
                  />
                  <div>
                    <p className="text-sm">{token.title}</p>
                    <p className={"text-[#9CA3AF] text-xs items-left flex"}>
                      {token.currency}
                    </p>
                  </div>
                </td>
                <td className="text-sm">
                  {token.toPresentation(token.balance)} {token.currency}
                </td>
                <td className="text-sm">{token.price}</td>
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
                <img
                  src={token.icon}
                  alt="icon"
                  className="w-6 h-6 mr-[13px]"
                />
                <div>
                  <p className="text-sm leading-5">{token.title}</p>
                  <p className="text-[#9CA3AF] text-xs items-left flex leading-3">
                    {token.currency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm leading-5">
                  {token.toPresentation(token.balance)} {token.currency}
                </div>
                <div className="text-sm leading-3">{token.price}</div>
              </div>
            </div>
          ))}
        </div>
      </ProfileContainer>
      <ProfileAssetsNFT nfts={nfts} />
    </ProfileTemplate>
  )
}

export default ProfileAssetsPage
