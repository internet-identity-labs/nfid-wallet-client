import { Principal } from "@dfinity/principal"
import { useActor } from "@xstate/react"
import ProfileInfo from "packages/ui/src/organisms/profile-info"
import { NFTs } from "packages/ui/src/organisms/profile-tabs/nfts"
import { useContext, useEffect, useMemo, useState } from "react"
import useSWR from "swr"

import { Loader, TabsSwitcher } from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"

import ProfileCollectiblesPage from "frontend/features/collectibles"
import { useAllToken } from "frontend/features/fungible-token/use-all-token"
import { getWalletDelegationAdapter } from "frontend/integration/adapters/delegations"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { MarketPlace } from "frontend/integration/nft/enum/enums"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"
import { NFT } from "frontend/integration/nft/nft"
import { nftService } from "frontend/integration/nft/nft-service"
import { ProfileContext } from "frontend/provider"
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
  const globalServices = useContext(ProfileContext)
  const { token, isLoading: isTokenLoading } = useAllToken()

  const tokensUsdValue = useMemo(() => {
    return token
      .filter((token) => token.rate)
      .reduce((total, token) => {
        return (
          total + (Number(token.balance) / 10 ** token.decimals) * token.rate!
        )
      }, 0)

    // Will add NFT floor price to calculation later!
  }, [token])
  const [, send] = useActor(globalServices.transferService)
  const {
    data: identity,
    isLoading: isIdentityLoading,
    isValidating,
  } = useSWR("globalIdentity", () =>
    getWalletDelegationAdapter("nfid.one", "-1"),
  )

  const onSendClick = () => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: "send" })
    send("SHOW")
  }

  const onReceiveClick = () => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: "receive" })
    send("SHOW")
  }

  // if (!identity) return <Loader isLoading />

  return (
    <ProfileTemplate iconId="activity" className="overflow-inherit">
      <Loader isLoading={isLoading} />
      {/* <ProfileInfo
        value={tokensUsdValue}
        isLoading={isTokenLoading && isIdentityLoading && isValidating}
        onSendClick={onSendClick}
        onReceiveClick={onReceiveClick}
        address={identity!.getPrincipal().toString()}
      /> */}
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
