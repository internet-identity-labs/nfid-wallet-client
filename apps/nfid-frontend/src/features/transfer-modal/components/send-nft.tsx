import clsx from "clsx"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR from "swr"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  IconCmpNFTPreview,
  Image,
  Label,
  BlurredLoader,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { getWalletName } from "@nfid/integration"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { Spinner } from "frontend/ui/atoms/loader/spinner"
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
  selectedReceiverWallet?: string
  onTransferPromise: (data: ITransferSuccess) => void
}

export const TransferNFT = ({
  selectedReceiverWallet,
  onTransferPromise,
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState("")
  const { applicationsMeta } = useApplicationsMeta()

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
    {
      onSuccess: () => {
        calculateFee()
      },
    },
  )

  const { data: accountsOptions, isLoading: isAccountsLoading } = useSWR(
    selectedConnector ? [selectedConnector, "accountsOptions"] : null,
    ([connector]) => connector.getAccountsOptions(),
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    getValues,
    resetField,
  } = useForm({
    mode: "all",
    defaultValues: {
      to: selectedReceiverWallet ?? "",
    },
  })

  const {
    data: transferFee,
    mutate: calculateFee,
    isValidating: isFeeLoading,
  } = useSWR(
    selectedConnector ? [selectedConnector, getValues, "nftTransferFee"] : null,
    ([selectedConnector, getValues]) =>
      selectedConnector?.getFee({
        to: getValues("to"),
        contract: selectedNFT?.contractId ?? "",
        tokenId: selectedNFT?.tokenId ?? "",
        standard: selectedNFT?.collection.standard ?? "",
      }),
    {
      refreshInterval: 5000,
    },
  )

  const submit = useCallback(
    async (values: any) => {
      if (!selectedNFT) return toast.error("No selected NFT")
      if (!selectedConnector) return toast.error("No selected connector")

      onTransferPromise({
        assetImg: selectedNFT?.assetPreview,
        initialPromise: new Promise(async (resolve) => {
          const res = await selectedConnector.transfer({
            identity: await selectedConnector.getIdentity(
              selectedNFT.account.domain,
              selectedNFT.account.accountId,
            ),
            to: values.to,
            contract: selectedNFT?.contractId ?? "",
            tokenId: selectedNFT?.tokenId ?? "",
            standard: selectedNFT?.collection.standard ?? "",
          })

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
        },
      })
    },
    [onTransferPromise, refetchNFTs, selectedConnector, selectedNFT],
  )

  const loadingMessage = useMemo(() => {
    if (isNFTLoading) return "Fetching your NFTs..."
    if (isAccountsLoading) return "Loading accounts..."
  }, [isAccountsLoading, isNFTLoading])

  return (
    <BlurredLoader
      overlayClassnames="rounded-xl"
      isLoading={isNFTLoading || isAccountsLoading}
      loadingMessage={loadingMessage}
    >
      <div className="space-y-3 text-xs ">
        <ChooseModal
          label="NFT to transfer"
          optionGroups={nftOptions ?? []}
          title={"Choose an NFT"}
          onSelect={(value) => {
            setSelectedNFTId(value)
            calculateFee()
          }}
          iconClassnames="!w-12 !h-12 !object-cover rounded-md"
          trigger={
            <div
              className="flex items-center justify-between w-full h-[90px] pl-0.5 p-2 pr-5 border border-black rounded-md"
              id="choose-nft"
            >
              <div className="flex items-center">
                <div className="relative flex items-center mr-2.5">
                  {selectedNFT?.assetPreview ? (
                    <Image
                      className="object-cover rounded-sm w-[84px] h-[84px]"
                      src={selectedNFT?.assetPreview}
                      alt={""}
                    />
                  ) : (
                    <IconCmpNFTPreview className="text-gray-100 rounded-sm w-[84px] h-[84px]" />
                  )}

                  <div
                    className={clsx(
                      "absolute w-6 h-6 bg-white rounded-full bottom-1 right-1",
                      "flex items-center justify-center",
                      !selectedNFT && "hidden",
                    )}
                  >
                    <Image
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
        <div className="text-gray-400">
          <p className="mb-1">From</p>
          <div className={clsx("rounded-md bg-gray-100 px-2.5 h-14 mt-1")}>
            {selectedNFT ? (
              <div className="flex flex-col justify-center h-full">
                <p className="text-black mb-[3px]">
                  {getWalletName(
                    applicationsMeta ?? [],
                    selectedNFT?.account.domain ?? "",
                    selectedNFT?.account.accountId ?? "",
                  )}
                </p>
                <p>{truncateString(selectedNFT?.owner ?? "", 40)}</p>
              </div>
            ) : (
              <p className="leading-[56px] text-sm">Your NFT account address</p>
            )}
          </div>
        </div>
        <ChooseModal
          label="To"
          optionGroups={accountsOptions ?? []}
          title={"Choose an account"}
          onSelect={(value) => {
            resetField("to")
            setValue("to", value)
            calculateFee()
          }}
          type="input"
          placeholder={`Recipient ${
            selectedNFT?.blockchain ?? "blockchain"
          } address`}
          isFirstPreselected={false}
          errorText={errors.to?.message}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => selectedConnector?.validateAddress(value),
            onBlur: calculateFee,
          })}
        />
        <div>
          <Label>Network fee</Label>
          <div
            className={clsx(
              "flex items-center justify-between mt-1",
              "px-2.5 text-gray-400 bg-gray-100 rounded-md h-14",
            )}
          >
            <div>
              <p className="text-sm">
                {selectedNFT?.blockchain === Blockchain.IC
                  ? "Instant"
                  : "Estimated"}
              </p>
            </div>
            {isFeeLoading ? (
              <Spinner className="w-3 h-3 text-gray-400" />
            ) : (
              <div className="text-right">
                <p className="text-sm leading-5">
                  ${transferFee?.feeUsd ?? "0.00"}
                </p>

                <p className="text-xs leading-5" id="fee">
                  {transferFee?.fee ??
                    `0.00 ${
                      selectedConnector?.getTokenConfig()?.feeCurrency ?? ""
                    }`}
                </p>
              </div>
            )}
          </div>
        </div>
        <Button
          className="text-base"
          type="primary"
          block
          onClick={handleSubmit(submit)}
          icon={<IconCmpArrow className="rotate-[135deg]" />}
        >
          Send
        </Button>
      </div>
    </BlurredLoader>
  )
}
