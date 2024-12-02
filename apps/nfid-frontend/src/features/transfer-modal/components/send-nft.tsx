import toaster from "packages/ui/src/atoms/toast"
import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useState } from "react"
import useSWR from "swr"

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
  const [status, setStatus] = useState(SendStatus.PENDING)

  const { data: nfts, isLoading: isNftListLoading } = useSWR(
    "nftList",
    () => fetchNFTs(),
    { revalidateOnFocus: false },
  )

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
          toaster.success(
            `Transaction ${selectedNFT?.getTokenName()} successful`,
            {
              toastId: "successTransfer",
            },
          )
          setStatus(SendStatus.COMPLETED)
        })
        .catch((e) => {
          console.error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          toaster.error("Something went wrong")
          setStatus(SendStatus.FAILED)
        })
    },
    [selectedNFT],
  )

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
      status={status}
    />
  )
}
