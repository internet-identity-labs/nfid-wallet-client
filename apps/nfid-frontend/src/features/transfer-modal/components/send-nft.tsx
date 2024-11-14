import toaster from "packages/ui/src/atoms/toast"
import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useEffect, useMemo, useState } from "react"
import useSWR from "swr"

import { sendReceiveTracking } from "@nfid/integration"

import {
  fetchNFT,
  fetchNFTsInited,
} from "frontend/features/collectibles/utils/util"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { NFT } from "frontend/integration/nft/nft"

import {
  getIdentity,
  mapUserNFTDetailsToGroupedOptions,
  validateNftAddress,
} from "../utils"
import { ITransferSuccess } from "./send-success"

interface ITransferNFT {
  preselectedNFTId?: string
  selectedReceiverWallet?: string
  onTransfer: (data: ITransferSuccess) => void
}

export const TransferNFT = ({
  selectedReceiverWallet,
  onTransfer,
  preselectedNFTId = "",
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState(preselectedNFTId)
  const [isNftListLoading, setIsNftListLoading] = useState(false)
  const [paginationState, setPaginationState] = useState<{
    page: number
    nfts: NFT[]
    totalPages: number | null
  }>({
    page: 1,
    nfts: [],
    totalPages: null,
  })

  const { page, nfts, totalPages } = paginationState

  useEffect(() => {
    const getNfts = async () => {
      setIsNftListLoading(true)
      const data = await fetchNFTsInited(page)

      setPaginationState((prevState) => ({
        ...prevState,
        totalPages: data.totalPages,
        nfts:
          data.totalPages >= page
            ? [...prevState.nfts, ...data.initedData]
            : prevState.nfts,
      }))
      setIsNftListLoading(false)
    }

    getNfts()
  }, [page])

  const {
    data: selectedNFT,
    mutate: refetchNFT,
    isLoading: isNftLoading,
  } = useSWR(selectedNFTId ? ["nft", selectedNFTId] : null, ([, tokenId]) =>
    fetchNFT(tokenId, page),
  )

  const handleTrackTransfer = useCallback(() => {
    sendReceiveTracking.sendToken({
      destinationType: "address",
      tokenName: selectedNFT?.getTokenId() || "",
      tokenType: "non-fungible",
      amount: 1,
      fee: 0,
    })
  }, [selectedNFT])

  const hasMore = useMemo(() => {
    return totalPages ? page < totalPages : true
  }, [page, totalPages])

  const loadMore = useCallback(() => {
    if (isNftListLoading || !hasMore) return
    setPaginationState((prevState) => ({
      ...prevState,
      page: prevState.page + 1,
    }))
  }, [isNftListLoading, hasMore])

  const submit = useCallback(
    async (values: any) => {
      if (!selectedNFT) return toaster.error("No selected NFT")

      onTransfer({
        assetImg: selectedNFT?.getAssetPreview().url,
        initialPromise: new Promise(async (resolve) => {
          const identity = await getIdentity([selectedNFT.getCollectionId()])

          try {
            const res = await transferEXT(
              selectedNFT.getTokenId(),
              identity,
              values.to,
            )
            handleTrackTransfer()
            resolve({ hash: String(res) })
          } catch (e) {
            throw Error((e as Error).message)
          }
        }),
        title: selectedNFT.getTokenName(),
        subTitle: selectedNFT.getCollectionName(),
        callback: () => {
          refetchNFT()
        },
      })
    },
    [handleTrackTransfer, onTransfer, refetchNFT, selectedNFT],
  )

  return (
    <TransferNFTUi
      isLoading={isNftLoading && isNftListLoading}
      loadingMessage={"Loading NFTs..."}
      nftOptions={mapUserNFTDetailsToGroupedOptions(nfts)}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFTId={selectedNFTId}
      selectedNFT={selectedNFT}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      validateAddress={validateNftAddress}
      loadMore={hasMore ? loadMore : undefined}
    />
  )
}
