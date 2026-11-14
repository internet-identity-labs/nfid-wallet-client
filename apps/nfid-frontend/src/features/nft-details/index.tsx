import clsx from "clsx"
import { NFTDetails } from "packages/ui/src/organisms/nft-details"
import {
  useCallback,
  useContext,
  MouseEvent,
  useEffect,
  useReducer,
  FC,
} from "react"
import { useLocation, useParams } from "react-router-dom"

import {
  IconSvgArrow,
  IconSvgArrowWhite,
  Loader,
  Tooltip,
} from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import { NFIDTheme } from "frontend/App"
import { useDarkTheme } from "frontend/hooks"
import { ProfileContext } from "frontend/provider"
import { NotFound } from "@nfid-frontend/ui"
import { ProfileTemplate } from "@nfid-frontend/ui"

import { fetchNFT, fetchViewOnlyNFT } from "../collectibles/utils/util"
import { ModalType } from "../transfer-modal/types"
import { nftInitialState, nftReducer } from "./utils"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { marketplaceService } from "@nfid/integration/marketplace"
import { fetchSellerListings } from "../marketplace/utils"
import { useIdentity } from "frontend/hooks/identity"

type NftDetailsProps = {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

const DEFAULT_LIMIT_PER_PAGE = 8

const NFTDetailsPage: FC<NftDetailsProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const isDarkTheme = useDarkTheme()
  const {
    transferService,
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
  } = useContext(ProfileContext)
  const [state, dispatch] = useReducer(nftReducer, nftInitialState)
  const { tokenId } = useParams()
  const location = useLocation()
  const { identity } = useIdentity()
  const currentPage = location.state?.currentPage
  const limitPerPage = currentPage ? DEFAULT_LIMIT_PER_PAGE : undefined

  const { data: nft, isLoading } = useSWR(
    tokenId ? ["nft", tokenId] : null,
    ([, tokenId]: [string, string]) =>
      isViewOnlyMode && viewOnlyAddress && viewOnlyAddressType
        ? fetchViewOnlyNFT(
            tokenId,
            viewOnlyAddress,
            viewOnlyAddressType,
            currentPage,
            limitPerPage,
          )
        : fetchNFT(tokenId, currentPage, limitPerPage),
  )

  const getDetails = useCallback(async () => {
    if (!tokenId) return

    const nftDetails = await (
      isViewOnlyMode && viewOnlyAddress && viewOnlyAddressType
        ? fetchViewOnlyNFT(
            tokenId,
            viewOnlyAddress,
            viewOnlyAddressType,
            currentPage,
            limitPerPage,
          )
        : fetchNFT(tokenId, currentPage, limitPerPage)
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
  }, [tokenId, currentPage, isViewOnlyMode, viewOnlyAddress])

  useEffect(() => {
    getDetails()
  }, [getDetails])

  const onTransferNFT = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!nft) return
      e.preventDefault()

      transferService.send({
        type: "ASSIGN_SELECTED_NFT",
        data: nft.getTokenId(),
      })
      transferService.send({ type: "CHANGE_TOKEN_TYPE", data: "nft" })
      transferService.send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })

      transferService.send({ type: "SHOW" })
    },
    [nft, transferService],
  )

  const { data: sellerListings = [] } = useSWR(
    isViewOnlyMode ? null : "listings/user",
    () => fetchSellerListings(),
    { revalidateOnFocus: false },
  )

  const listing = nft
    ? sellerListings.find(
        (l) =>
          l.collectionId === nft.getCollectionId() &&
          l.tokenId.toString() === nft.getTokenId(),
      )
    : undefined

  const onListNFT = useCallback(async () => {
    if (!identity) return
    await marketplaceService.listNft(identity, {
      collectionId: "vehwg-aiaaa-aaaag-aciuq-cai",
      tokenId: BigInt(1),
      priceE8s: BigInt(100000),
    })
  }, [identity])

  const onDelistNFT = useCallback(async () => {
    if (!identity) return
    await marketplaceService.cancelListing(identity, BigInt(1))
  }, [identity])

  if (isLoading) return <Loader isLoading />
  if (!nft) return <NotFound hideNavigation />

  return (
    <ProfileTemplate
      titleClassNames="hidden sm:block"
      showBackButton
      backButtonPathname={`${ProfileConstants.base}/${ProfileConstants.nfts}`}
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
      headerMenu={
        !nft.getError() &&
        !isViewOnlyMode && (
          <div className="flex items-center space-x-4">
            <Tooltip tip={listing ? "Cannot send while listed" : "Send"}>
              <div
                className={clsx(
                  "p-[8px] rounded-[12px]",
                  listing
                    ? "opacity-30 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 active:bg-gray-200",
                )}
                onClick={listing ? undefined : onTransferNFT}
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
        onListNFT={onListNFT}
        onDelistNFT={onDelistNFT}
        listing={listing}
      />
    </ProfileTemplate>
  )
}

export default NFTDetailsPage
