import { IGroupedOptions } from "packages/ui/src/molecules/choose-modal/types"
import React, { useMemo } from "react"
import { useForm } from "react-hook-form"

<<<<<<< HEAD
import { Image } from "@nfid-frontend/ui"
=======
import { ChooseModal } from "@nfid-frontend/ui"
import { groupArrayByField } from "@nfid-frontend/utils"
>>>>>>> feea2d104 (feat([sc-6070]): transfer eth)

import { DropdownSelect } from "../../../atoms/dropdown-select"
import { Button } from "../../../molecules/button"
import { InputDropdown } from "../../../molecules/input-dropdown"
import ArrowWhite from "../assets/arrowWhite.svg"
import { NFT } from "../types"
import { TransferSendNFTInfo } from "./nft/nft-info"
import { TransferSendNFTPlaceholder } from "./nft/nft-placeholder"
import { makeAddressFieldValidation, validateAddressField } from "./utils"

export interface ITransferNFT {
  to: string
  tokenId: string
}

interface ITransferModalSendNFT {
  nfts: NFT[]
  onNFTSubmit: (values: ITransferNFT) => void
  setSelectedNFTs: (nftIds: string[]) => void
  selectedNFTIds: string[]
  walletOptions: IGroupedOptions[]
  selectedNFTDetails?: NFT
}

export const TransferModalSendNFT: React.FC<ITransferModalSendNFT> = ({
  nfts,
  onNFTSubmit,
  setSelectedNFTs,
  walletOptions,
  selectedNFTDetails,
  selectedNFTIds,
}) => {
  const nftOptions = useMemo(() => {
    const formattedOptions = nfts.map((nft) => ({
      title: nft.name,
      value: nft.tokenId,
      subTitle: nft.collection.name,
      icon: nft.assetPreview,
      walletName: nft?.walletName ?? "",
    }))

    const groupedOptions = groupArrayByField(
      formattedOptions,
      "walletName",
    ).map((group) => ({
      label: group[0]?.walletName,
      options: group,
    }))

    return groupedOptions
  }, [nfts])

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<ITransferNFT>({ defaultValues: { to: "" } })

  React.useEffect(() => {
    if (selectedNFTIds.length) {
      setValue("tokenId", selectedNFTIds[0])
    }
  }, [selectedNFTDetails, setValue, selectedNFTIds])

  return (
    <>
      <div>
        {selectedNFTDetails ? (
          <TransferSendNFTInfo nft={selectedNFTDetails} />
        ) : (
          <TransferSendNFTPlaceholder />
        )}
        <div className="mt-5 space-y-2 text-black">
          <ChooseModal
            label="NFT to transfer"
            optionGroups={nftOptions}
            title="Choose NFT"
            onSelect={(value) => setSelectedNFTs([value])}
          />
          <ChooseModal
            label="To"
            optionGroups={walletOptions}
            title={"Choose an account"}
            onSelect={(value) => setValue("to", value)}
            type="input"
            placeholder="Recipient principal or account ID"
            isFirstPreselected={false}
            errorText={errors.to?.message}
            registerFunction={register("to", {
              validate: makeAddressFieldValidation(true),
              required: "This field cannot be empty",
            })}
          />
        </div>
      </div>
      <Button
        block
        className="flex items-center justify-center mt-auto"
        id="send-nft-button"
        onClick={handleSubmit(onNFTSubmit)}
        icon={
          <Image
            src={ArrowWhite}
            alt="ArrowWhite"
            className="w-[18px] h-[18px mr-[10px]"
          />
        }
      >
        Send
      </Button>
    </>
  )
}
