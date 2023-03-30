import clsx from "clsx"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  IconPngEthereum,
  IconSvgDfinity,
  IconSvgNFTPreview,
  Image,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { getWalletName } from "@nfid/integration"

import { useAllNFTs } from "frontend/apps/identity-manager/profile/assets/hooks"
import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"

import { useNFTsOptions } from "../hooks/use-nfts-options"
import { useWalletOptions } from "../hooks/use-wallets-options"
import { makeAddressFieldValidation } from "../utils/validations"

interface ITransferNFT {
  assignReceiverWallet: (value: string) => void
  assignSelectedNFT: (value: UserNonFungibleToken) => void
  selectedReceiverWallet?: string
  onSubmit: () => void
}

export const TransferNFT = ({
  selectedReceiverWallet,
  assignSelectedNFT,
  assignReceiverWallet,
  onSubmit,
}: ITransferNFT) => {
  const { applicationsMeta } = useApplicationsMeta()
  const { nftsOptions } = useNFTsOptions()
  const { nfts } = useAllNFTs()
  const [selectedNFTId, setSelectedNFTId] = useState("")

  const selectedNFT = useMemo(() => {
    return nfts?.find((nft) => nft.tokenId === selectedNFTId)
  }, [nfts, selectedNFTId])

  const { walletOptions } = useWalletOptions(
    selectedNFT?.blockchain === "Ethereum" ? "ETH" : "ICP",
  )
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,

    resetField,
  } = useForm({
    mode: "all",
    defaultValues: {
      to: selectedReceiverWallet ?? "",
    },
  })

  const submit = useCallback(
    (values: any) => {
      if (!selectedNFT) throw new Error("No selected nft")
      assignSelectedNFT(selectedNFT)
      assignReceiverWallet(values.to)

      onSubmit()
    },
    [assignReceiverWallet, assignSelectedNFT, onSubmit, selectedNFT],
  )

  return (
    <div className="-mt-2 space-y-2 text-xs">
      <ChooseModal
        label="NFT to transfer"
        optionGroups={nftsOptions}
        title={"Choose an NFT"}
        onSelect={(value) => setSelectedNFTId(value)}
        iconClassnames="!w-12 !h-12 !object-cover rounded-md"
        trigger={
          <div className="flex items-center justify-between w-full h-[131px] p-2 pr-5 border border-black rounded-md">
            <div className="flex items-center">
              <div className="relative flex items-center mr-2.5">
                <Image
                  className="object-cover rounded-sm w-28 h-28"
                  src={selectedNFT?.assetPreview ?? IconSvgNFTPreview}
                  alt={""}
                />

                <div
                  className={clsx(
                    "absolute w-6 h-6 bg-white rounded-full bottom-1 right-1",
                    "flex items-center justify-center",
                    !selectedNFT && "hidden",
                  )}
                >
                  <Image
                    className="w-4"
                    src={
                      selectedNFT?.blockchain === "Ethereum"
                        ? IconPngEthereum
                        : IconSvgDfinity
                    }
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
              <p>{truncateString(selectedNFT.owner, 40)}</p>
            </div>
          ) : (
            <p className="leading-[56px] text-sm">Your NFT account address</p>
          )}
        </div>
      </div>
      <ChooseModal
        label="To"
        optionGroups={walletOptions}
        title={"Choose an account"}
        onSelect={(value) => {
          resetField("to")
          setValue("to", value)
        }}
        type="input"
        placeholder={`Recipient ${
          selectedNFT?.blockchain ?? "blockchain"
        } address`}
        isFirstPreselected={false}
        errorText={errors.to?.message}
        registerFunction={register("to", {
          required: "This field cannot be empty",
          validate: makeAddressFieldValidation(
            selectedNFT?.blockchain === "Ethereum" ? "ETH" : "ICP",
          ),
        })}
      />
      <Button
        className="text-base !mt-[35px]"
        type="primary"
        block
        onClick={handleSubmit(submit)}
        icon={<IconCmpArrow className="rotate-[135deg]" />}
      >
        Send
      </Button>
    </div>
  )
}
