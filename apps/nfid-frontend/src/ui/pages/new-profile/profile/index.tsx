import { Principal } from "@dfinity/principal"
import { NFTs } from "packages/ui/src/organisms/profile-tabs/nfts"
import { useEffect, useState } from "react"

import { Loader, TabsSwitcher } from "@nfid-frontend/ui"

import ProfileCollectiblesPage from "frontend/features/collectibles"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { MarketPlace } from "frontend/integration/nft/enum/enums"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"
import { NFT } from "frontend/integration/nft/nft"
import { nftService } from "frontend/integration/nft/nft-service"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface NFTDetails {
  about: string
  assetFullSize: AssetPreview
  transactions: NFTTransactions
  properties: TokenProperties
}

export interface NFTProps {
  assetPreview: AssetPreview
  collectionId: string
  collectionName: string
  details: NFTDetails
  marketPlace: MarketPlace
  millis: number
  tokenFloorPriceICP?: string
  tokenFloorPriceUSD?: string
  tokenId: string
  tokenName: string
  tokenNumber: number
  tokenLink: string
}

const renderTabContent = (currentTab: string, isLoading: boolean) => {
  // SubRoutes here
  switch (currentTab) {
    case "Tokens":
      return "Tokens"
    case "NFTs":
      return <ProfileCollectiblesPage />
    case "Activity":
      return "Activity"
    default:
      return "Tokens"
  }
}

const tabs = [
  {
    name: "Tokens",
    title: <>Tokens</>,
  },
  {
    name: "NFTs",
    title: <>NFTs</>,
  },
  {
    name: "Activity",
    title: <>Activity</>,
  },
]

interface ProfileProps extends React.HTMLAttributes<HTMLDivElement> {}

const Profile: React.FC<ProfileProps> = ({}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("Tokens")

  return (
    <ProfileTemplate iconId="activity" className="overflow-inherit">
      <Loader isLoading={isLoading} />
      <TabsSwitcher
        className="my-[30px]"
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <ProfileContainer className="!p-0" innerClassName="p-[20px] md:p-[30px]">
        {renderTabContent(activeTab, false)}
        {/* <Switch */}
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default Profile
