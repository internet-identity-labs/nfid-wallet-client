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
import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

import {
  getAccount,
  getIdentity,
  mapUserNFTDetailsToGroupedOptions,
  validateAddress,
} from "../utils"
import { ITransferSuccess } from "./success"

interface ITransferNFT {
  preselectedNFTId?: string
  selectedReceiverWallet?: string
  onTransferPromise: (data: ITransferSuccess) => void
}

export const TransferNFT = ({
  selectedReceiverWallet,
  onTransferPromise,
  preselectedNFTId = "",
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState(preselectedNFTId)
  const [selectedAccountAddress, setSlectedAccountAddress] = useState("")

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

  useEffect(() => {
    const getAddress = async () => {
      const address = await getAccount()
      setSlectedAccountAddress(address)
    }

    getAddress()
  }, [])

  const { data: selectedFtConnector } = useSWR(
    ["ICP", Blockchain.IC, "selectedConnector"],
    ([selectedTokenCurrency, selectedTokenBlockchain]) =>
      getConnector({
        type: TransferModalType.FT,
        currency: selectedTokenCurrency,
        blockchain: selectedTokenBlockchain,
      }),
    {
      onSuccess: () => {
        refetchBalance()
      },
    },
  )

  const {
    data: balance,
    mutate: refetchBalance,
    isValidating: isBalanceFetching,
    isLoading: isBalanceLoading,
  } = useSWR(
    selectedFtConnector && selectedAccountAddress
      ? [selectedFtConnector, selectedAccountAddress, "balance"]
      : null,
    ([connector, preselectedAccountAddress]) =>
      connector.getBalance(preselectedAccountAddress, "ICP"),
    { refreshInterval: 10000 },
  )

  const handleTrackTransfer = useCallback(() => {
    sendReceiveTracking.sendToken({
      network: "ICP",
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
          const identity = await getIdentity(undefined, undefined, [
            selectedNFT.getCollectionId(),
          ])

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
      isLoading={isNftLoading && isNftListLoading}
      isBalanceLoading={isBalanceLoading && isBalanceFetching}
      loadingMessage={"Loading NFTs..."}
      nftOptions={mapUserNFTDetailsToGroupedOptions(allNfts)}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFTId={selectedNFTId}
      selectedNFT={selectedNFT}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      selectedAccountAddress={selectedAccountAddress}
      balance={Number(balance)}
      validateAddress={validateAddress}
    />
  )
}
