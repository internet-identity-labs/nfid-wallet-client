import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { fetchTokenByAddress } from "packages/ui/src/organisms/tokens/utils"
import { useCallback, useState } from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import { sendReceiveTracking } from "@nfid/integration"
import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import {
  fetchNFT,
  fetchNFTsInited,
} from "frontend/features/collectibles/utils/util"
import { transferEXT } from "frontend/integration/entrepot/ext"

import {
  getIdentity,
  mapUserNFTDetailsToGroupedOptions,
  validateICPAddress,
} from "../utils"
import { ITransferSuccess } from "./success"

interface ITransferNFT {
  preselectedNFTId?: string
  selectedReceiverWallet?: string
  onTransferPromise: (data: ITransferSuccess) => void
  publicKey: string
}

export const TransferNFT = ({
  selectedReceiverWallet,
  onTransferPromise,
  preselectedNFTId = "",
  publicKey,
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState(preselectedNFTId)
  const { data: icpToken } = useSWR(
    ICP_CANISTER_ID ? ["token", ICP_CANISTER_ID] : null,
    ([, address]) => fetchTokenByAddress(address),
  )

  const {
    data: allNfts = [],
    isLoading: isNftListLoading,
    mutate: refetchAllNfts,
  } = useSWR("allNFTS", fetchNFTsInited)
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
      if (!selectedNFT) return toast.error("No selected NFT")

      onTransferPromise({
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
          refetchAllNfts()
          refetchNFT()
        },
      })
    },
    [
      handleTrackTransfer,
      onTransferPromise,
      refetchAllNfts,
      refetchNFT,
      selectedNFT,
    ],
  )

  return (
    <TransferNFTUi
      publicKey={publicKey}
      icpToken={icpToken}
      isLoading={isNftLoading && isNftListLoading}
      loadingMessage={"Loading NFTs..."}
      nftOptions={mapUserNFTDetailsToGroupedOptions(allNfts)}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFTId={selectedNFTId}
      selectedNFT={selectedNFT}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      validateAddress={validateICPAddress}
    />
  )
}
