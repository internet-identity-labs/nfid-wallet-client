import toaster from "packages/ui/src/atoms/toast"
import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useState } from "react"
import useSWR from "swr"

import { sendReceiveTracking } from "@nfid/integration"

import { fetchNFT, fetchNFTs } from "frontend/features/collectibles/utils/util"
import { transferEXT } from "frontend/integration/entrepot/ext"

import { getIdentity, validateNftAddress } from "../utils"
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

  const { data: nfts, isLoading: isNftListLoading } = useSWR(
    "nftList",
    () => fetchNFTs(),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

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
      nfts={nfts?.items}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFTId={selectedNFTId}
      selectedNFT={selectedNFT}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      validateAddress={validateNftAddress}
    />
  )
}
