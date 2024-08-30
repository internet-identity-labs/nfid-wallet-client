import { HTMLAttributes, FC } from "react"
import { FT } from "src/integration/ft/ft"

import { BlurredLoader } from "@nfid-frontend/ui"

import { ActiveToken } from "./components/active-asset"
import { ProfileAssetsHeader } from "./components/header"
import { NewAssetsModal } from "./components/new-assets-modal"

interface ProfileAssetsProps extends HTMLAttributes<HTMLDivElement> {
  activeTokens: FT[]
  filteredTokens: FT[]
  isActiveTokensLoading: boolean
  isFilterTokensLoading: boolean
  setSearchQuery: (v: string) => void
}

const ProfileAssets: FC<ProfileAssetsProps> = ({
  activeTokens,
  filteredTokens,
  isActiveTokensLoading,
  isFilterTokensLoading,
  setSearchQuery,
}) => {
  return (
    <BlurredLoader
      isLoading={isActiveTokensLoading}
      overlayClassnames="!rounded-[24px]"
    >
      <ProfileAssetsHeader
        tokens={filteredTokens}
        setSearch={(value) => setSearchQuery(value)}
        isLoading={isFilterTokensLoading}
      />
      <table className="w-full text-left">
        <thead className="text-secondary h-[40px] hidden md:table-header-group">
          <tr className="text-sm font-bold leading-5">
            <th className="pr-[30px]">Name</th>
            <th className="w-[230px] pr-[10px]">Category</th>
            <th className="w-[230px] pr-[10px]">Token balance</th>
            <th className="w-[186px] pr-[10px]">USD balance</th>
            <th className="w-[24px]"></th>
          </tr>
        </thead>
        <tbody className="h-16 text-sm text-black">
          {activeTokens.map((token) => (
            <ActiveToken key={`token_${token.getTokenName()}`} token={token} />
          ))}
        </tbody>
      </table>
      <NewAssetsModal tokens={null} />
    </BlurredLoader>
  )
}

export default ProfileAssets
