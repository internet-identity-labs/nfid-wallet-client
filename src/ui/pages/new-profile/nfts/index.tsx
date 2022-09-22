import clsx from "clsx"
import React from "react"
import { AiOutlineWallet } from "react-icons/ai"
import { IoIosSearch } from "react-icons/io"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Accordion } from "frontend/ui/atoms/accordion"
import { Input } from "frontend/ui/atoms/input"
import { Loader } from "frontend/ui/atoms/loader"
import NFTPreview from "frontend/ui/atoms/nft-preview"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import {
  filterUserTokens,
  sortUserTokens,
  userTokensByCollection,
  userTokensByWallet,
} from "./util"

interface IProfileNFTsPage extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  tokens: UserNFTDetails[]
}

const ProfileNFTsPage: React.FC<IProfileNFTsPage> = ({ isLoading, tokens }) => {
  const [search, setSearch] = React.useState("")
  const tokensFiltered = React.useMemo(
    () => filterUserTokens(tokens, { search }),
    [tokens, search],
  )
  const tokensByWallet = React.useMemo(
    () =>
      userTokensByWallet(
        Object.values(userTokensByCollection(sortUserTokens(tokensFiltered)))
          .map((x) => x.tokens)
          .flat(),
      ),
    [tokensFiltered],
  )
  return (
    <ProfileTemplate
      pageTitle="Your NFTs"
      onBack={`${ProfileConstants.base}/${ProfileConstants.assets}`}
    >
      <div className={clsx(`flex flex-col gap-6 pb-10`)}>
        {/* <ProfileContainer className={clsx(`bg-gray-200`)}> */}
        <div className={clsx(`px-[4px]`)}>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            inputClassName={clsx(`!bg-white border-slate-100`)}
            icon={<IoIosSearch size="20" />}
            placeholder="Search by NFT name, ID or collection"
          />
        </div>
        {/* </ProfileContainer> */}
        {!tokens.length && (
          <>{isLoading ? <Loader isLoading={true} /> : "You have no NFTs!"}</>
        )}
        {Object.values(tokensByWallet)
          .sort((a, b) => (a.account.label < b.account.label ? -1 : 1))
          .map((wallet) => (
            <ProfileContainer
              key={`wallet${wallet.principal}`}
              // title={wallet.account.label}
            >
              <Accordion
                isBorder={false}
                style={{ padding: 0 }}
                title={
                  <div
                    className={clsx(
                      `flex justify-between items-center w-[100%] gap-5`,
                    )}
                  >
                    <div className={clsx(`flex gap-2 items-center font-light`)}>
                      <AiOutlineWallet /> {wallet.account.label}
                    </div>
                    <div className={clsx(`text-sm text-slate-400 font-light`)}>
                      {wallet.tokens.length} Item
                      {wallet.tokens.length > 1 && "s"}
                    </div>
                  </div>
                }
                details={
                  <div
                    className={clsx(`flex justify-center gap-3 flex-wrap pt-7`)}
                  >
                    {wallet.tokens.map((token) => (
                      <NFTPreview key={`token${token.tokenId}`} {...token} />
                    ))}
                  </div>
                }
              />
            </ProfileContainer>
          ))}
      </div>
    </ProfileTemplate>
  )
}

export default ProfileNFTsPage
