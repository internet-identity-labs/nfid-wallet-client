import clsx from "clsx"
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
} from "@nfid-frontend/ui"

import { UserNonFungibleToken } from "frontend/features/non-fungible-token/types"
import { ITransferNFTConnector } from "frontend/ui/connnector/transfer-modal/types"

export interface TransferNFTUiProps {
  isLoading: boolean
  isBalanceLoading: boolean
  loadingMessage: string | undefined
  nftOptions: IGroupedOptions[] | undefined
  setSelectedNFTId: Dispatch<SetStateAction<string>>
  selectedNFTId: string
  selectedNFT: UserNonFungibleToken | undefined
  selectedConnector: ITransferNFTConnector | undefined
  selectedReceiverWallet: string | undefined
  submit: (values: any) => Promise<Id | undefined>
  selectedAccountAddress: string
  balance: number
}

export const TransferNFTUi: FC<TransferNFTUiProps> = ({
  isLoading,
  isBalanceLoading,
  loadingMessage,
  nftOptions,
  setSelectedNFTId,
  selectedNFTId,
  selectedNFT,
  selectedConnector,
  selectedReceiverWallet,
  submit,
  selectedAccountAddress,
  balance,
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
          isLoading={isBalanceLoading}
          selectedTokenCurrency={"ICP"}
          decimals={8}
          balance={balance}
          selectedAccountAddress={selectedAccountAddress}
        />
      </div>
    </BlurredLoader>
  )
}
