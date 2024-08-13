import clsx from "clsx"
import { useState } from "react"

import { Loader, TabsSwitcher } from "@nfid-frontend/ui"

import { useAllNFTs } from "frontend/apps/identity-manager/profile/assets/hooks"
import { ProfileCollectibles } from "frontend/apps/identity-manager/profile/collectibles/profile-collectibles"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import Icon from "./transactions.svg"

export type TokenToRemove = {
  canisterId: string
  name: string
}

const renderTabContent = (
  currentTab: string,
  nfts: any,
  isLoading: boolean,
  applications: any,
) => {
  switch (currentTab) {
    case "Tokens":
      return "Tokens"
    case "NFTs":
      return <NFTs />
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

  const { nfts, isLoading: isNFTLoading } = useAllNFTs()
  const applications = useApplicationsMeta()

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
        {renderTabContent(activeTab, nfts, false, applications)}
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default Profile
