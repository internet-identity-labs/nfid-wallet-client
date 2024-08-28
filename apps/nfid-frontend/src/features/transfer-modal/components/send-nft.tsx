import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import useSWR, { mutate } from "swr"

import { Loader } from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"

import {
  fetchNFT,
  fetchNFTs,
  fetchNFTsInited,
} from "frontend/features/collectibles/utils/util"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { resetCachesByKey } from "frontend/ui/connnector/cache"
import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { mapUserNFTDetailsToGroupedOptions } from "frontend/ui/connnector/transfer-modal/util/nfts"
import { Blockchain } from "frontend/ui/connnector/types"

import { getIdentity } from "../utils"
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
  const [selectedAccountAddress, setSelectedAccountAddress] = useState("")
  const {
    data: allNfts = [],
    mutate: refetchNFTs,
    isLoading: isNftListLoading,
  } = useSWR("allNFTS", fetchNFTsInited)
  const {
    data: selectedNFT,
    mutate: refetchNFT,
    isLoading: isNftLoading,
  } = useSWR(selectedNFTId ? ["nft", selectedNFTId] : null, ([, tokenId]) =>
    fetchNFT(tokenId),
  )

  console.log("1211", allNfts)

  const { data: selectedFtConnector, isLoading: isConnectorLoading } = useSWR(
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
    ([connector, selectedAccountAddress]) =>
      connector.getBalance(selectedAccountAddress, "ICP"),
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
  }, [selectedNFT?.getTokenId()])

  const submit = useCallback(
    async (values: any) => {
      if (!selectedNFT) return toast.error("No selected NFT")

      onTransferPromise({
        assetImg: selectedNFT?.getAssetPreview().url,
        initialPromise: new Promise(async (resolve) => {
          // await selectedConnector?.getFee({
          //   to: values.to,
          //   contract: selectedNFT?.getTokenId() ?? "",
          //   tokenId: selectedNFT?.getTokenId() ?? "",
          //   standard: selectedNFT?.collection.standard ?? "",
          // })

          // const res = await selectedConnector.transfer({
          //   identity: await selectedConnector.getIdentity(
          //     selectedNFT.account.domain,
          //     selectedNFT.account.accountId,
          //     [selectedNFT.contractId],
          //   ),
          //   to: values.to,
          //   contract: selectedNFT?.contractId ?? "",
          //   tokenId: selectedNFT?.tokenId ?? "",
          //   standard: selectedNFT?.collection.standard ?? "",
          // })
          const identity = await getIdentity(undefined, undefined, [
            selectedNFT.getTokenId(),
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
        // callback: () => {
        //   resetCachesByKey(
        //     [
        //       `${selectedConnector.constructor.name}:getNFTOptions:[]`,
        //       `${selectedConnector.constructor.name}:getNFTs:[]`,
        //     ],
        //     () => refetchNFTs(),
        //   )

        //   mutate(
        //     (key: any) =>
        //       key && Array.isArray(key) && key[0] === "useNftConfig",
        //   )
        //   mutate(
        //     (key: any) =>
        //       key && Array.isArray(key) && key[0] === "useTokenConfig",
        //   )
        // },
      })
    },
    [handleTrackTransfer, onTransferPromise, refetchNFTs, selectedNFT],
  )

  // const loadingMessage = useMemo(() => {
  //   if (isConnectorLoading) return "Loading token config..."
  //   //if (isAccountsLoading || isAccountsValidating) return "Loading accounts..."
  // }, [isConnectorLoading, isAccountsLoading, isAccountsValidating])

  return (
    <TransferNFTUi
      isLoading={isNftLoading && isNftListLoading}
      isBalanceLoading={isBalanceLoading && isBalanceFetching}
      loadingMessage={"Loading token config..."}
      nftOptions={mapUserNFTDetailsToGroupedOptions(allNfts)}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFTId={selectedNFTId}
      selectedNFT={selectedNFT}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      selectedAccountAddress={selectedAccountAddress}
      balance={Number(balance)}
    />
  )
}
