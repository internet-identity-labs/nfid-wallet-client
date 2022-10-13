import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { UserNFTDetails } from "frontend/integration/entrepot/types"
import { Button } from "frontend/ui/atoms/button"
import { DropdownSelect } from "frontend/ui/atoms/dropdown-select"
import { Input } from "frontend/ui/atoms/input"

import ArrowWhite from "../assets/arrowWhite.svg"
import { TransferSendNFTInfo } from "./nft/nft-info"
import { TransferSendNFTPlaceholder } from "./nft/nft-placeholder"
import { validateAddressField } from "./utils"

export interface ITransferNFT {
  to: string
  tokenId: string
}

interface ITransferModalSendNFT {
  nfts: UserNFTDetails[]
  onNFTSubmit: (values: ITransferNFT) => void
}

export const TransferModalSendNFT: React.FC<ITransferModalSendNFT> = ({
  nfts,
  onNFTSubmit,
}) => {
  const [selectedNFTS, setSelectedNFTS] = useState<string[]>([])
  const selectedNFTDetails = useMemo(() => {
    if (!selectedNFTS.length) return
    return nfts.find((nft) => nft.tokenId === selectedNFTS[0])
  }, [nfts, selectedNFTS])

  const nftOptions = useMemo(() => {
    return nfts.map((nft) => ({
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
  } = useForm<ITransferNFT>()

  useEffect(() => {
    if (selectedNFTS.length) setValue("tokenId", selectedNFTS[0])
  }, [selectedNFTDetails, selectedNFTS, setValue])

  return (
    <div className="flex flex-col justify-between flex-grow">
      <div>
        {selectedNFTDetails ? (
          <TransferSendNFTInfo nft={selectedNFTDetails} />
        ) : (
          <TransferSendNFTPlaceholder />
        )}
        <div className="mt-5 space-y-2 text-black-base">
          <DropdownSelect
            placeholder="Choose NFT"
            label="NFT to transfer"
            options={nftOptions}
            selectedValues={selectedNFTS}
            setSelectedValues={setSelectedNFTS}
            isSearch
            isMultiselect={false}
          />
          <Input
            inputClassName="!text-sm placeholder:!text-sm !h-10"
            labelText="To"
            placeholder="Recipient principal or account ID"
            errorText={errors.to?.message}
            {...register("to", {
              validate: validateAddressField,
              required: "This field cannot be empty",
            })}
          />
        </div>
      </div>
      <Button
        block
        primary
        className="flex items-center justify-center mt-auto"
        id="send-nft-button"
        onClick={handleSubmit(onNFTSubmit)}
      >
        <img
          src={ArrowWhite}
          alt="ArrowWhite"
          className="w-[18px] h-[18px mr-[10px]"
        />
        Send
      </Button>
    </div>
  )
}
