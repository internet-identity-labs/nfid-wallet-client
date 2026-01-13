import clsx from "clsx"
import ImageWithFallback from "@nfid/ui/atoms/image-with-fallback"
import { Dispatch, FC, SetStateAction } from "react"
import { useFormContext } from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  IconCmpArrow,
  IconCmpArrowRight,
  IconCmpNFTPreview,
  IconNftPlaceholder,
  ChooseNftModal,
  Label,
  IGroupedSendAddress,
} from "@nfid/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { NFT } from "frontend/integration/nft/nft"

import { SendSuccessUi } from "./send-success"
import {
  NftSearchRequest,
  UserAddressPreview,
} from "frontend/integration/address-book"
import { ChooseAddressModal } from "@nfid/ui/molecules/choose-modal/address-modal"

export interface TransferNFTFormValues {
  to: string
}

export interface TransferNFTUiProps {
  isLoading: boolean
  loadingMessage: string | undefined
  nfts: NFT[] | undefined
  setSelectedNFTId: Dispatch<SetStateAction<string>>
  selectedNFT: NFT | undefined
  selectedReceiverWallet: string | undefined
  submit: (values: TransferNFTFormValues) => Promise<Id | undefined>
  validateAddress: (value: string) => boolean | string
  isSuccessOpen: boolean
  onClose: () => void
  status: SendStatus
  addresses: IGroupedSendAddress[] | undefined
  searchAddress: (req: NftSearchRequest) => Promise<UserAddressPreview[]>
}

export const TransferNFTUi: FC<TransferNFTUiProps> = ({
  nfts,
  setSelectedNFTId,
  selectedNFT,
  selectedReceiverWallet: _selectedReceiverWallet,
  submit,
  validateAddress,
  isSuccessOpen,
  onClose,
  status,
  addresses,
  searchAddress,
}) => {
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext()
  const to = watch("to")

  return (
    <>
      <SendSuccessUi
        title={`${selectedNFT?.getTokenName()}`}
        subTitle={`${selectedNFT?.getCollectionName()}`}
        onClose={onClose}
        assetImg={`${selectedNFT?.getAssetPreview()?.url}`}
        isOpen={isSuccessOpen}
        status={status}
        assetImageClassname="w-[102px] h-[102px] top-[161px] sm:w-[116px] sm:h-[116px] sm:top-[154px]"
      />
      <div className="text-xs">
        <Label className="inline-block mb-1 text-xs dark:text-white">
          NFT to transfer
        </Label>
        <ChooseNftModal
          tokens={nfts ?? []}
          title="NFT to send"
          onSelect={setSelectedNFTId}
          trigger={
            <div
              className={clsx(
                "flex items-center justify-between w-full h-[98px] rounded-[12px]",
                "pl-0.5 p-2 pr-5 border border-black dark:border-zinc-500 cursor-pointer mb-[10px]",
              )}
              id="choose-nft"
            >
              <div className="flex items-center">
                <div className="relative flex items-center mr-2.5">
                  {selectedNFT?.getAssetPreview()?.url ? (
                    selectedNFT?.getAssetPreview()?.format === "video" ? (
                      <video
                        muted
                        autoPlay
                        loop
                        className="object-cover rounded-[10px] w-[92px] h-[92px]"
                        src={selectedNFT.getAssetPreview()?.url}
                      ></video>
                    ) : (
                      <ImageWithFallback
                        className="object-cover rounded-[10px] w-[92px] h-[92px]"
                        src={selectedNFT?.getAssetPreview()?.url}
                        fallbackSrc={IconNftPlaceholder}
                        alt="NFID NFT"
                      />
                    )
                  ) : (
                    <IconCmpNFTPreview className="text-gray-100 rounded-[10px] w-[92px] h-[92px] dark:text-zinc-500" />
                  )}
                </div>
                {!selectedNFT ? (
                  <p className="text-sm leading-3 text-gray-400 dark:text-zinc-500">
                    Choose NFT
                  </p>
                ) : (
                  <div>
                    <p className="mb-1 text-sm">{selectedNFT.getTokenName()}</p>
                    <p className="text-xs leading-3 text-gray-400">
                      {selectedNFT.getCollectionName()}
                    </p>
                  </div>
                )}
              </div>
              <div className="cursor-pointer">
                <IconCmpArrowRight />
              </div>
            </div>
          }
        />
        <ChooseAddressModal<NftSearchRequest>
          title="Send to"
          addresses={addresses}
          placeholder="Recipient wallet address or account ID"
          errorText={errors["to"]?.message as string}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => validateAddress(value),
          })}
          searchAddress={searchAddress}
          token={undefined}
        />
        <Button
          id={"sendButton"}
          disabled={Boolean(errors["to"]?.message) || !to || !selectedNFT}
          className="absolute bottom-5 left-5 right-5 !w-auto"
          type="primary"
          block
          onClick={handleSubmit(submit)}
          icon={<IconCmpArrow className="rotate-[135deg]" />}
        >
          Send
        </Button>
      </div>
    </>
  )
}
