import clsx from "clsx"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import { BalanceFooter } from "packages/ui/src/organisms/send-receive/components/balance-footer"
import { Dispatch, FC, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { Id } from "react-toastify"

import {
  Button,
  ChooseModal,
  IconCmpArrow,
  IconCmpArrowRight,
  IconCmpNFTPreview,
  BlurredLoader,
  Input,
  IGroupedOptions,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"

import { FT } from "frontend/integration/ft/ft"
import { NFT } from "frontend/integration/nft/nft"

export interface TransferNFTUiProps {
  publicKey: string
  icpToken: FT | undefined
  isLoading: boolean
  loadingMessage: string | undefined
  nftOptions: IGroupedOptions[] | undefined
  setSelectedNFTId: Dispatch<SetStateAction<string>>
  selectedNFTId: string
  selectedNFT: NFT | undefined
  selectedReceiverWallet: string | undefined
  submit: (values: any) => Promise<Id | undefined>
  validateAddress: (value: string) => boolean | string
}

export const TransferNFTUi: FC<TransferNFTUiProps> = ({
  publicKey,
  icpToken,
  isLoading,
  loadingMessage,
  nftOptions,
  setSelectedNFTId,
  selectedNFTId,
  selectedNFT,
  selectedReceiverWallet,
  submit,
  validateAddress,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "all",
    defaultValues: {
      to: selectedReceiverWallet ?? "",
    },
  })

  return (
    <BlurredLoader
      overlayClassnames="rounded-xl"
      isLoading={isLoading}
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
                  {selectedNFT?.getAssetPreview().url ? (
                    <ImageWithFallback
                      className="object-cover rounded-[10px] w-[84px] h-[84px]"
                      src={selectedNFT?.getAssetPreview().url}
                      fallbackSrc={IconNftPlaceholder}
                      alt="NFID NFT"
                    />
                  ) : (
                    <IconCmpNFTPreview className="text-gray-100 rounded-[10px] w-[84px] h-[84px]" />
                  )}
                </div>
                {!selectedNFT ? (
                  <p className="leading-3 text-gray-400">Choose NFT</p>
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
          type="trigger"
        />
        <Input
          inputClassName={clsx(
            "border !border-black rounded-[12px] h-14",
            "flex items-center justify-between",
            "text-black px-4",
            errors.to?.message && "!border-red-600 ring ring-red-100",
          )}
          placeholder="Recipient wallet address or account ID"
          type="text"
          labelText="To"
          errorText={errors.to?.message}
          id="to"
          {...register("to", {
            required: "This field cannot be empty",
            validate: (value) => validateAddress(value),
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
        <BalanceFooter token={icpToken} publicKey={publicKey} />
      </div>
    </BlurredLoader>
  )
}
