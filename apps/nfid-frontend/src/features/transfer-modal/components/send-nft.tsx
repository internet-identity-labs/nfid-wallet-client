import clsx from "clsx"
import { BalanceFooter } from "packages/ui/src/organisms/send-receive/components/balance-footer"
import { useCallback, useEffect, useMemo, useState } from "react"
import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR, { mutate } from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  IconCmpNFTPreview,
  BlurredLoader,
  Input,
} from "@nfid-frontend/ui"
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

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      to: selectedReceiverWallet ?? "",
    },
  })

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

  const handleTrackTransfer = React.useCallback(() => {
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
            to: getValues("to"),
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
      getValues,
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
    <BlurredLoader
      overlayClassnames="rounded-xl"
      isLoading={isNFTLoading || isConnectorLoading}
      loadingMessage={loadingMessage}
    >
      <div className="space-y-3 text-xs ">
        <ChooseModal
          label="NFT to transfer"
          optionGroups={nftOptions ?? []}
          title={"Choose an NFT"}
          onSelect={(value) => {
            setSelectedNFTId(value)
          }}
          preselectedValue={selectedNFTId}
          iconClassnames="!w-12 !h-12 !object-cover rounded-[12px]"
          trigger={
            <div
              className="flex items-center justify-between w-full h-[90px] pl-0.5 p-2 pr-5 border border-black rounded-[12px]"
              id="choose-nft"
            >
              <div className="flex items-center">
                <div className="relative flex items-center mr-2.5">
                  {selectedNFT?.assetPreview ? (
                    <img
                      className="object-cover rounded-[10px] w-[84px] h-[84px]"
                      src={selectedNFT?.assetPreview.url}
                      alt={""}
                    />
                  ) : (
                    <IconCmpNFTPreview className="text-gray-100 rounded-[10px] w-[84px] h-[84px]" />
                  )}

                  <div
                    className={clsx(
                      "absolute w-6 h-6 bg-white rounded-full bottom-1 right-1",
                      "flex items-center justify-center",
                      !selectedNFT && "hidden",
                    )}
                  >
                    <img
                      className="w-4"
                      src={selectedNFT?.blockchainLogo}
                      alt=""
                    />
                  </div>
                </div>
                {!selectedNFT ? (
                  <p className="leading-3 text-gray-400">Choose NFT</p>
                ) : (
                  <div>
                    <p className="mb-1 text-sm">{selectedNFT.name}</p>
                    <p className="text-xs leading-3 text-gray-400">
                      {selectedNFT.collection.name}
                    </p>
                  </div>
                )}
              </div>
              <div className="cursor-pointer">
                <IconCmpArrowRight />
              </div>
            </div>
          }
          type="trigger"
        />
        <Input
          inputClassName={clsx(
            "border !border-black rounded-[12px] h-14",
            "flex items-center justify-between",
            "text-black px-4",
            errors.to?.message && "!border-red-600 ring ring-red-100",
          )}
          placeholder={`Recipient ${
            selectedNFT?.blockchain ?? "blockchain"
          } address`}
          type="text"
          labelText="To"
          errorText={errors.to?.message}
          id="to"
          {...register("to", {
            required: "This field cannot be empty",
            validate: (value) => selectedConnector?.validateAddress(value),
          })}
        />
        <Button
          className="text-base !mt-[107px]"
          type="primary"
          block
          onClick={handleSubmit(submit)}
          icon={<IconCmpArrow className="rotate-[135deg]" />}
        >
          Send
        </Button>
        <BalanceFooter
          isLoading={isBalanceLoading && isBalanceFetching}
          selectedTokenCurrency={"ICP"}
          decimals={8}
          balance={balance}
          selectedAccountAddress={selectedAccountAddress}
        />
      </div>
    </BlurredLoader>
  )
}
