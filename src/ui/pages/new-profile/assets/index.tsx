import clsx from "clsx"
import React from "react"
import { generatePath, useNavigate } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ProfileAssetsNFT } from "./nft"
import Icon from "./transactions.svg"

interface IProfileAssetsPage extends React.HTMLAttributes<HTMLDivElement> {
  onIconClick: () => void
  tokens: any[]
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
  return (
    <ProfileTemplate
      pageTitle="Assets"
      icon={Icon}
      iconTooltip="Transactions history"
      onIconClick={onIconClick}
      className="overflow-inherit"
    >
      <ProfileContainer title="Your tokens">
        <Loader isLoading={!tokens.length} />
        <table className={clsx("text-left w-full hidden sm:table")}>
          <thead className={clsx("border-b border-black-base h-16")}>
            <tr className={clsx("font-bold text-sm leading-5")}>
              <th>Name</th>
              <th>Token balance</th>
              <th>USD balance</th>
            </tr>
          </thead>
          <tbody className="h-16 text-sm text-[#0B0E13]">
            {tokens.map((token, index) => (
              <tr
                key={`token_${index}`}
                onClick={handleNavigateToTokenDetails(token.currency)}
                className="cursor-pointer hover:bg-gray-200"
              >
                <td className="flex items-center h-16 pl-4">
                  <img
                    src={token.icon}
                    alt="icon"
                    className="w-6 h-6 mr-[18px]"
                  />
                  <div>
                    <p className="text-sm">{token.title}</p>
                    <p className={"text-[#9CA3AF] text-xs items-left flex"}>
                      {token.currency}
                    </p>
                  </div>
                </td>
                <td className="text-sm">{token.balance}</td>
                <td className="text-sm">{token.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sm:hidden">
          {tokens.map((token, index) => (
            <div
              key={`token_${index}`}
              className="flex items-center justify-between h-16"
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
                <div className="text-sm leading-5">{token.balance}</div>
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
