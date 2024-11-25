import toaster from "packages/ui/src/atoms/toast"
import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useState } from "react"
import useSWR from "swr"

import { sendReceiveTracking } from "@nfid/integration"

import { fetchNFT, fetchNFTs } from "frontend/features/collectibles/utils/util"
import { transferEXT } from "frontend/integration/entrepot/ext"

import { SendStatus } from "../types"
import { getIdentity, validateNftAddress } from "../utils"

interface ITransferNFT {
  preselectedNFTId?: string
  selectedReceiverWallet?: string
  onClose: () => void
}

export const TransferNFT = ({
  selectedReceiverWallet,
  preselectedNFTId = "",
  onClose,
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState(preselectedNFTId)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [sendStatus, setSendStatus] = useState(SendStatus.PENDING)

  const {
    data: nfts,
    isLoading: isNftListLoading,
    mutate,
  } = useSWR("nftList", () => fetchNFTs(), { revalidateOnFocus: false })

  const { data: selectedNFT, isLoading: isNftLoading } = useSWR(
    selectedNFTId ? ["nft", selectedNFTId] : null,
    ([, tokenId]) => fetchNFT(tokenId),
  )

  const submit = useCallback(
    async (values: { to: string }) => {
      if (!selectedNFT) return toaster.error("No selected NFT")

      setIsSuccessOpen(true)
      const identity = await getIdentity([selectedNFT.getCollectionId()])

      transferEXT(selectedNFT.getTokenId(), identity, values.to)
        .then(() => {
          setSendStatus(SendStatus.COMPLETED)
          mutate(
            {
              totalItems: nfts!.totalItems - 1,
              totalPages: nfts!.totalPages,
              items: [],
            },
            false,
          )

          sendReceiveTracking.sendToken({
            destinationType: "address",
            tokenName: selectedNFT?.getTokenId() || "",
            tokenType: "non-fungible",
            amount: 1,
            fee: 0,
          })
        })
        .catch((e) => {
          console.error(e)
          setSendStatus(SendStatus.FAILED)
          toaster.error(`Transfer error: ${(e as Error).message}`)
        })
    },
    [selectedNFT],
  )

  // const submit = useCallback(
  //   async (values: any) => {
  //     if (!selectedNFT) return toaster.error("No selected NFT")

  //     onTransfer({
  //       assetImg: selectedNFT?.getAssetPreview().url,
  //       initialPromise: new Promise(async (resolve) => {
  //         const identity = await getIdentity([selectedNFT.getCollectionId()])

  //         try {
  //           const res = await transferEXT(
  //             selectedNFT.getTokenId(),
  //             identity,
  //             values.to,
  //           )
  //           handleTrackTransfer()
  //           resolve({ hash: String(res) })
  //         } catch (e) {
  //           throw Error((e as Error).message)
  //         }
  //       }),
  //       title: selectedNFT.getTokenName(),
  //       subTitle: selectedNFT.getCollectionName(),
  //       callback: () => {
  //         refetchNFT()
  //       },
  //     })
  //   },
  //   [handleTrackTransfer, onTransfer, refetchNFT, selectedNFT],
  // )

  return (
    <TransferNFTUi
      isLoading={isNftLoading && isNftListLoading}
      loadingMessage={"Loading NFTs..."}
      nfts={nfts?.items}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFT={selectedNFT}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      validateAddress={validateNftAddress}
      isSuccessOpen={isSuccessOpen}
      onClose={onClose}
      sendStatus={sendStatus}
    />
  )
}
