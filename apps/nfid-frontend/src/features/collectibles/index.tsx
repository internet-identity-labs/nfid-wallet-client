import { useActor } from "@xstate/react"
import { NFTs } from "packages/ui/src/organisms/nfts"
import { MouseEvent, useCallback, useContext } from "react"
import useSWR from "swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { searchTokens } from "frontend/features/collectibles/utils/util"
import { ProfileContext } from "frontend/provider"

import { fetchNFTs } from "./utils/util"

const ProfileCollectiblesPage = () => {
  const { data: nfts = [], isLoading } = useSWR("nfts", fetchNFTs)
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const onTransferNFT = useCallback(
    (e: MouseEvent<HTMLDivElement>, id: string) => {
      e.preventDefault()

      send({ type: "ASSIGN_SELECTED_NFT", data: id })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: "send" })

      send("SHOW")
    },
    [send],
  )

  return (
    <NFTs
      nfts={nfts}
      isLoading={isLoading}
      searchTokens={searchTokens}
      links={ProfileConstants}
      onTransferNFT={onTransferNFT}
    />
  )
}

export default ProfileCollectiblesPage
