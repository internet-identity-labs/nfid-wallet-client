import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import useSWR, { mutate } from "swr"

import { sendReceiveTracking } from "@nfid/integration"

import { resetCachesByKey } from "frontend/ui/connnector/cache"
import {
  getAllNFT,
  getAllNFTOptions,
  getConnector,
} from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

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
  const { data: nfts, mutate: refetchNFTs } = useSWR("allNFTS", getAllNFT)
  const { data: nftOptions, isLoading: isNFTLoading } = useSWR(
    "allNFTSOptions",
    getAllNFTOptions,
  )

  const selectedNFT = useMemo(() => {
    return nfts?.find((nft) => nft.tokenId === selectedNFTId)
  }, [nfts, selectedNFTId])

  const { data: selectedConnector } = useSWR(
    selectedNFT?.blockchain
      ? [selectedNFT?.blockchain, "nftSelectedConnector"]
      : null,
    ([chain]) =>
      getConnector({
        type: TransferModalType.NFT,
        blockchain: chain,
      }),
  )

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
    data: accountsOptions,
    isLoading: isAccountsLoading,
    isValidating: isAccountsValidating,
  } = useSWR(
    selectedFtConnector
      ? [selectedFtConnector, false, "accountsOptions"]
      : null,
    ([connector, isVault]) =>
      connector.getAccountsOptions({
        currency: "ICP",
        isVault,
        isRootOnly: true,
      }),
  )

  useEffect(() => {
    if (!accountsOptions?.length) return
    setSelectedAccountAddress(accountsOptions[0].options[0].value)
  }, [accountsOptions])

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
    const token = selectedConnector?.getTokenConfig()
    if (!token) return

    sendReceiveTracking.sendToken({
      network: token.blockchain,
      destinationType: "address",
      tokenName: selectedNFT?.tokenId || "",
      tokenType: "non-fungible",
      tokenStandard: selectedNFT?.collection.standard || "",
      amount: 1,
      fee: 0,
    })
  }, [
    selectedConnector,
    selectedNFT?.collection.standard,
    selectedNFT?.tokenId,
  ])

  const submit = useCallback(
    async (values: any) => {
      if (!selectedNFT) return toast.error("No selected NFT")
      if (!selectedConnector) return toast.error("No selected connector")

      onTransferPromise({
        assetImg: selectedNFT?.assetPreview.url,
        initialPromise: new Promise(async (resolve) => {
          await selectedConnector?.getFee({
            to: values.to,
            contract: selectedNFT?.contractId ?? "",
            tokenId: selectedNFT?.tokenId ?? "",
            standard: selectedNFT?.collection.standard ?? "",
          })

          const res = await selectedConnector.transfer({
            identity: await selectedConnector.getIdentity(
              selectedNFT.account.domain,
              selectedNFT.account.accountId,
              [selectedNFT.contractId],
            ),
            to: values.to,
            contract: selectedNFT?.contractId ?? "",
            tokenId: selectedNFT?.tokenId ?? "",
            standard: selectedNFT?.collection.standard ?? "",
          })

          handleTrackTransfer()
          resolve(res)
        }),
        title: selectedNFT.name,
        subTitle: selectedNFT.collection.name,
        callback: () => {
          resetCachesByKey(
            [
              `${selectedConnector.constructor.name}:getNFTOptions:[]`,
              `${selectedConnector.constructor.name}:getNFTs:[]`,
            ],
            () => refetchNFTs(),
          )

          mutate(
            (key: any) =>
              key && Array.isArray(key) && key[0] === "useNftConfig",
          )
          mutate(
            (key: any) =>
              key && Array.isArray(key) && key[0] === "useTokenConfig",
          )
        },
      })
    },
    [
      handleTrackTransfer,
      onTransferPromise,
      refetchNFTs,
      selectedConnector,
      selectedNFT,
    ],
  )

  const loadingMessage = useMemo(() => {
    if (isConnectorLoading) return "Loading token config..."
    if (isAccountsLoading || isAccountsValidating) return "Loading accounts..."
  }, [isConnectorLoading, isAccountsLoading, isAccountsValidating])

  return (
    <TransferNFTUi
      isLoading={isNFTLoading || isConnectorLoading}
      isBalanceLoading={isBalanceLoading && isBalanceFetching}
      loadingMessage={loadingMessage}
      nftOptions={nftOptions}
      setSelectedNFTId={setSelectedNFTId}
      selectedNFTId={selectedNFTId}
      selectedNFT={selectedNFT}
      selectedConnector={selectedConnector}
      selectedReceiverWallet={selectedReceiverWallet}
      submit={submit}
      selectedAccountAddress={selectedAccountAddress}
      balance={Number(balance)}
    />
  )
}
