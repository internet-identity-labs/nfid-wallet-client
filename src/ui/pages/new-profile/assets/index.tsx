import clsx from "clsx"
import React from "react"

import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import WithoutNFT from "./NFTsoon.png"
import Icon from "./book-open.svg"

interface IProfileAssetsPage extends React.HTMLAttributes<HTMLDivElement> {
  onIconClick: () => void
  tokens: any[]
}

const ProfileAssetsPage: React.FC<IProfileAssetsPage> = ({
  onIconClick,
  tokens,
}) => {
  return (
    <ProfileTemplate pageTitle="Assets" icon={Icon} onIconClick={onIconClick}>
      <ProfileContainer title="Your tokens">
        <table className={clsx("text-left w-full hidden sm:table")}>
          <thead className={clsx("border-b border-black-base h-16")}>
            <tr className={clsx("font-bold text-sm leading-5")}>
              <th>Name</th>
              <th>Balance</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody className="h-16 text-sm text-[#0B0E13]">
            {tokens.map((token, index) => (
              <tr key={`token_${index}`}>
                <td className="flex items-center h-16">
                  <img
                    src={token.icon}
                    alt="icon"
                    className="w-6 h-6 mr-[18px]"
                  />
                  <div>
                    <p className="text-sm">{token.title}</p>
                    <p className={"text-[#9CA3AF] text-xs items-left flex"}>
                      {token.subTitle}
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
                    ICP
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
      <div className="w-full mt-[30px] mb-12">
        <img src={WithoutNFT} alt="noIcons" className="w-full" />
      </div>
    </ProfileTemplate>
  )
}

export default ProfileAssetsPage
