import { useActor } from "@xstate/react"
import { NFTDetails } from "packages/ui/src/organisms/nft-details"
import {
  useCallback,
  useContext,
  MouseEvent,
  useEffect,
  useReducer,
} from "react"
import { useParams } from "react-router-dom"
import useSWR from "swr"

import { ProfileContext } from "frontend/provider"
import { Loader } from "frontend/ui/atoms/loader"
import { NotFound } from "frontend/ui/pages/404"

import { fetchNFT } from "../collectibles/utils/util"
import { nftInitialState, nftReducer } from "./utils"

const NFTDetailsPage = () => {
  const globalServices = useContext(ProfileContext)
  const [state, dispatch] = useReducer(nftReducer, nftInitialState)
  const [, send] = useActor(globalServices.transferService)
  const { tokenId } = useParams()

  const { data: nft, isLoading } = useSWR(
    tokenId ? ["nft", tokenId] : null,
    ([, tokenId]) => fetchNFT(tokenId),
  )

  const getDetails = useCallback(async () => {
    if (!tokenId) return

    try {
      const nftDetails = await fetchNFT(tokenId).then((data) =>
        data?.getDetails(),
      )
      if (nftDetails) {
        const tx = await nftDetails.getTransactions(0, 10)
        console.log("txxx", tx)
        dispatch({ type: "SET_ABOUT", payload: nftDetails.getAbout() })
        dispatch({
          type: "SET_FULL_SIZE",
          payload: await nftDetails.getAssetFullSize(),
        })
        dispatch({
          type: "SET_PROPERTIES",
          payload: await nftDetails.getProperties(),
        })
        dispatch({
          type: "SET_TRANSACTIONS",
          payload: await nftDetails.getTransactions(0, 10),
        })
      }
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: (e as Error).message })
      console.error("Error: ", e)
    } finally {
      dispatch({ type: "SET_LOADING", key: "fullSize", isLoading: false })
      dispatch({ type: "SET_LOADING", key: "properties", isLoading: false })
      dispatch({ type: "SET_LOADING", key: "transactions", isLoading: false })
    }
  }, [tokenId])

  useEffect(() => {
    getDetails()
  }, [getDetails])

  const onTransferNFT = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!nft) return
      e.preventDefault()

      send({ type: "ASSIGN_SELECTED_NFT", data: nft.getTokenId() })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: "send" })

      send("SHOW")
    },
    [nft, send],
  )

  if (isLoading) return <Loader isLoading />
  if (!nft) return <NotFound />

  return (
    <NFTDetails
      nft={nft}
      onTransferNFT={onTransferNFT}
      about={state.about.data}
      properties={state.properties.data}
      assetPreview={state.fullSize.data}
      transactions={state.transactions.data}
      isAboutLoading={state.about.isLoading}
      isPreviewLoading={state.fullSize.isLoading}
      isPropertiesLoading={state.properties.isLoading}
      isTransactionsLoading={state.transactions.isLoading}
    />
  )
}

export default NFTDetailsPage
