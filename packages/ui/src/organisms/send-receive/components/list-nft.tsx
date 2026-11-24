/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import {
  Button,
  IconCmpArrowRight,
  IconCmpNFTPreview,
  IconNftPlaceholder,
  ChooseNftModal,
  Label,
  BlurredLoader,
} from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { NFT } from "frontend/integration/nft/nft"

import { NFTMarketplaceSuccessUi } from "./nft-marketplace-success"

import { ChooseFromToken } from "./choose-from-token"
import { IModalType } from "../utils"
import { FT } from "frontend/integration/ft/ft"
import { ICP_FEE_E8S } from ".."

export interface ListNFTUiProps {
  isLoading: boolean
  loadingMessage: string | undefined
  nfts: NFT[] | undefined
  onSelectNFT: (nft: NFT) => void
  selectedNFT: NFT | undefined
  submit: (values: any) => Promise<void>
  isSuccessOpen: boolean
  onClose: () => void
  status: SendStatus
  token: FT | undefined
  minPrice: number
  error: string | undefined
  listedNftKeys?: Set<string>
}

export const ListNFTUi: FC<ListNFTUiProps> = ({
  isLoading,
  loadingMessage,
  nfts,
  onSelectNFT,
  selectedNFT,
  submit,
  isSuccessOpen,
  onClose,
  status,
  token,
  minPrice,
  error,
  listedNftKeys,
}) => {
  const {
    watch,
    handleSubmit,
    formState: { errors },
  } = useFormContext()
  const amount = watch("amount")

  if (isLoading)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-[24px] max-h-full"
        loadingMessage={loadingMessage}
        className="text-xs"
      />
    )

  return (
    <>
      <NFTMarketplaceSuccessUi
        assetImg={selectedNFT?.getAssetPreview()?.url ?? ""}
        title={`${selectedNFT?.getTokenName()}`}
        subTitle={`${selectedNFT?.getCollectionName()}`}
        isOpen={isSuccessOpen}
        onClose={onClose}
        status={status}
        error={error}
        isListing
        price={amount as string}
      />
      <div className="text-xs font-inter">
        <div className="leading-10 text-[20px] font-bold">List for sale</div>
        <p className="mt-0.5 text-sm leading-5 tracking-[0.2px]">
          Your NFT stays in your wallet until someone buys it. All your listings
          are on the My listings page in the Marketplace tab, where you can
          delist them at any time.
        </p>
        <Label className="inline-block mb-1 text-xs dark:text-white mt-4.5">
          NFT to list
        </Label>
        <ChooseNftModal
          tokens={nfts ?? []}
          title="Choose an NFT to list"
          onSelect={onSelectNFT}
          listedNftKeys={listedNftKeys}
          isMarketplace={true}
          searchInputId="choose-marketplace-nft"
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
        <Label className="inline-block mb-1 text-xs dark:text-white">
          Price
        </Label>
        <ChooseFromToken
          modalType={IModalType.LIST_NFT}
          id={"list-nft"}
          token={token}
          usdRate={token?.getTokenRateFormatted(amount)}
          value={amount}
          tokens={[]}
          minAmount={minPrice}
          title="Price"
          fee={ICP_FEE_E8S}
        />
        <div className="h-4 mt-1 text-xs leading-4 text-red-600">
          {errors["amount"] && (errors["amount"]?.message as string)}
        </div>
        <Button
          id={"listButton"}
          disabled={
            !selectedNFT || Boolean(errors["amount"]?.message) || !amount
          }
          className="w-full mt-[48px]"
          type="primary"
          block
          onClick={handleSubmit(submit)}
        >
          List for {amount} {token?.getTokenSymbol()}
        </Button>
      </div>
    </>
  )
}
