import { useActor } from "@xstate/react"
import clsx from "clsx"
import { NFTDetails } from "packages/ui/src/organisms/nft-details"
import {
  useCallback,
  useContext,
  MouseEvent,
  useEffect,
  useReducer,
} from "react"
import { useLocation, useParams } from "react-router-dom"

import {
  IconSvgArrow,
  IconSvgArrowWhite,
  Loader,
  Tooltip,
} from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import { useDarkTheme } from "frontend/hooks"
import { ProfileContext } from "frontend/provider"
import { NotFound } from "frontend/ui/pages/404"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { fetchNFT } from "../collectibles/utils/util"
import { ModalType } from "../transfer-modal/types"
import { nftInitialState, nftReducer } from "./utils"

const DEFAULT_LIMIT_PER_PAGE = 8

const NFTDetailsPage = () => {
  const isDarkTheme = useDarkTheme()
  const globalServices = useContext(ProfileContext)
  const [state, dispatch] = useReducer(nftReducer, nftInitialState)
  const [, send] = useActor(globalServices.transferService)
  const { tokenId } = useParams()
  const location = useLocation()
  const { currentPage } = location.state

  const { data: nft, isLoading } = useSWR(
    tokenId ? ["nft", tokenId] : null,
    ([, tokenId]: [string, string]) =>
      fetchNFT(tokenId, currentPage, DEFAULT_LIMIT_PER_PAGE),
  )

  const getDetails = useCallback(async () => {
    if (!tokenId) return

    const nftDetails = await fetchNFT(
      tokenId,
      currentPage,
      DEFAULT_LIMIT_PER_PAGE,
    ).then((data) => data?.getDetails())
    if (nftDetails) {
      try {
        dispatch({ type: "SET_ABOUT", payload: nftDetails.getAbout() })
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          key: "about",
          payload: (e as Error).message,
        })
        console.error("About error: ", e)
      } finally {
        dispatch({ type: "SET_LOADING", key: "about", isLoading: false })
      }

      try {
        dispatch({
          type: "SET_FULL_SIZE",
          payload: await nftDetails.getAssetFullSize(),
        })
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          key: "fullSize",
          payload: (e as Error).message,
        })
        console.error("Asset full size error: ", e)
      } finally {
        dispatch({ type: "SET_LOADING", key: "fullSize", isLoading: false })
      }

      try {
        dispatch({
          type: "SET_PROPERTIES",
          payload: await nftDetails.getProperties(),
        })
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          key: "properties",
          payload: (e as Error).message,
        })
        console.error("Properties error: ", e)
      } finally {
        dispatch({ type: "SET_LOADING", key: "properties", isLoading: false })
      }

      try {
        dispatch({
          type: "SET_TRANSACTIONS",
          payload: await nftDetails.getTransactions(0, 10),
        })
      } catch (e) {
        dispatch({
          type: "SET_ERROR",
          key: "transactions",
          payload: (e as Error).message,
        })
        console.error("Transactions error: ", e)
      } finally {
        dispatch({ type: "SET_LOADING", key: "transactions", isLoading: false })
      }
    }
  }, [tokenId, currentPage])

  useEffect(() => {
    getDetails()
  }, [getDetails])

  const onTransferNFT = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!nft) return
      e.preventDefault()

      send({ type: "ASSIGN_SELECTED_NFT", data: nft.getTokenId() })
      send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })

      send("SHOW")
    },
    [nft, send],
  )

  if (isLoading) return <Loader isLoading />
  if (!nft) return <NotFound />

  return (
    <ProfileTemplate
      titleClassNames="hidden sm:block"
      showBackButton
      headerMenu={
        !nft.getError() && (
          <div className="flex items-center space-x-4">
            <Tooltip tip="Send">
              <div
                className={clsx(
                  "p-[8px] rounded-[12px] cursor-pointer",
                  "hover:bg-gray-100 dark:hover:bg-zinc-700 active:bg-gray-200",
                )}
                onClick={onTransferNFT}
              >
                <img
                  className="rotate-[135deg]"
                  src={isDarkTheme ? IconSvgArrowWhite : IconSvgArrow}
                  alt="transfer"
                />
              </div>
            </Tooltip>
          </div>
        )
      }
      className="w-full z-[1]"
    >
      <NFTDetails
        nft={nft}
        about={state.about.data}
        properties={state.properties.data}
        assetPreview={state.fullSize.data}
        transactions={state.transactions.data}
        isAboutLoading={state.about.isLoading}
        isPreviewLoading={state.fullSize.isLoading}
        isPropertiesLoading={state.properties.isLoading}
        isTransactionsLoading={state.transactions.isLoading}
      />
    </ProfileTemplate>
  )
}

export default NFTDetailsPage
