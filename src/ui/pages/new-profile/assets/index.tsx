import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import WithoutNFT from "./NFTComing.png"
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
                      {token.currency}
                    </p>
                  </div>
                </td>
                <td className="text-sm">{token.balance}</td>
                <td className="text-sm">${token.price.toFixed(2)}</td>
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
                <div className="text-sm leading-3">
                  ${token.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ProfileContainer>
      <ProfileContainer
        title="Your NFTs"
        className={clsx("pb-40", "sm:pb-[26px] mt-[30px] relative")}
      >
        <div className="text-neutral-900 text-sm leading-5 max-w-[320px] z-20 relative">
          <p>
            Have{" "}
            <Link to={`${ProfileConstants.base}/${ProfileConstants.nfts}`}>
              NFTs
            </Link>{" "}
            in DSCVR, Distrikt, Stoic, Plug, InfinitySwap, and elsewhere on the
            IC and want to manage them from one place? Accidentally sent NFTs to
            the NNS and want them back?
          </p>
          <p className="mt-4 font-semibold">
            That and more coming soon to NFID!
          </p>
        </div>
        <img
          src={WithoutNFT}
          alt="Coming soon"
          className={clsx(
            "-bottom-32 -right-[80px] w-[110vw]",
            "sm:top-0 sm:-right-[30px] sm:w-2/3",
            "absolute z-10 max-w-none",
          )}
        />
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileAssetsPage
