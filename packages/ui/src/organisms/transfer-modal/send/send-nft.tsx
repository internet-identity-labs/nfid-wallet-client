import React, { useMemo } from "react"
import { useForm } from "react-hook-form"

import { DropdownSelect } from "../../../atoms/dropdown-select"
import { Button } from "../../../molecules/button"
import { InputDropdown } from "../../../molecules/input-dropdown"
import ArrowWhite from "../assets/arrowWhite.svg"
import { NFT } from "../types"
import { TransferSendNFTInfo } from "./nft/nft-info"
import { TransferSendNFTPlaceholder } from "./nft/nft-placeholder"
import { validateAddressField } from "./utils"

export interface ITransferNFT {
  to: string
  tokenId: string
}

interface ITransferModalSendNFT {
  nfts: NFT[]
  onNFTSubmit: (values: ITransferNFT) => void
  setSelectedNFTs: (nftIds: string[]) => void
  selectedNFTIds: string[]
  walletOptions?: { label: string; value: string }[]
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
    return nfts?.map((nft) => ({
      label: nft.name,
      value: nft.tokenId,
      icon: nft.assetPreview,
    }))
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
          <DropdownSelect
            placeholder="Choose NFT"
            label="NFT to transfer"
            options={nftOptions}
            selectedValues={selectedNFTIds}
            setSelectedValues={setSelectedNFTs}
            isSearch
            isMultiselect={false}
          />

          <InputDropdown
            label="To"
            placeholder="Recipient principal or account ID"
            options={
              walletOptions?.filter(
                (wallet) =>
                  wallet.value !== selectedNFTDetails?.principal.toText(),
              ) ?? []
            }
            errorText={errors.to?.message}
            registerFunction={register("to", {
              validate: validateAddressField,
              required: "This field cannot be empty",
            })}
            setValue={(value) => setValue("to", value)}
          />
        </div>
      </div>
      <Button
        block
        className="flex items-center justify-center mt-auto"
        id="send-nft-button"
        onClick={handleSubmit(onNFTSubmit)}
        icon={
          <img
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
