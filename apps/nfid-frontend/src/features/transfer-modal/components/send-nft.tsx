import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
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
  validateICPAddress,
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
  const [page, setPage] = useState(1)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isNftListLoading, setIsNftListLoading] = useState(false)
  const [totalPages, setTotalPages] = useState<number | null>(null)

  useEffect(() => {
    let totalPages
    const getNfts = async () => {
      setIsNftListLoading(true)
      const data = await fetchNFTsInited(page)
      totalPages = data.totalPages
      setTotalPages(data.totalPages)
      if (totalPages >= page) {
        setNfts((prevNfts) => [...prevNfts, ...data.initedData])
      }

      setIsNftListLoading(false)
    }

    getNfts()
  }, [page])

  const {
    data: selectedNFT,
    mutate: refetchNFT,
    isLoading: isNftLoading,
  } = useSWR(selectedNFTId ? ["nft", selectedNFTId] : null, ([, tokenId]) =>
    fetchNFT(tokenId),
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

  const handlePagination = () => {
    if (isNftListLoading) return
    setPage((prevPage) => prevPage + 1)
  }

  const submit = useCallback(
    async (values: any) => {
      if (!selectedNFT) return toast.error("No selected NFT")

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

  const stopPagination = totalPages ? page > totalPages : false

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
      validateAddress={validateICPAddress}
      onPaginate={handlePagination}
      stopPagination={stopPagination}
    />
  )
}
