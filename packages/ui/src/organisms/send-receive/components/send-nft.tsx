import { truncateString } from "@nfid-frontend/utils"
import clsx from "clsx"
import ImageWithFallback from "packages/ui/src/atoms/image-with-fallback"
import { Dispatch, FC, SetStateAction, useMemo, useState } from "react"
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
  Skeleton,
} from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { NFT } from "frontend/integration/nft/nft"

import { SendSuccessUi } from "./send-success"
import {
  NftSearchRequest,
  UserAddress,
  UserAddressPreview,
  UserAddressSaveRequest,
  UserAddressUpdateRequest,
} from "frontend/integration/address-book"
import { ChooseAddressModal } from "packages/ui/src/molecules/choose-modal/address-modal"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { MarketPlace } from "frontend/integration/nft/enum/enums"
import { FT } from "frontend/integration/ft/ft"
import { SendAddressBook } from "./send-address-book"
import {
  AddressBookModal,
  PredefinedAddress,
} from "../../address-book/AddressBookModal"
import {
  AddressBookAction,
  getAddressBookNftOptions,
} from "frontend/features/transfer-modal/utils"
import { ChooseAvailableAddressModal } from "packages/ui/src/molecules/choose-modal/available-address-modal"

export interface TransferNFTUiProps {
  isLoading: boolean
  loadingMessage: string | undefined
  nfts: NFT[] | undefined
  setSelectedNFTId: Dispatch<SetStateAction<string>>
  selectedNFT: NFT | undefined
  submit: (values: any) => Promise<Id | undefined>
  validateAddress: (value: string) => boolean | string
  isSuccessOpen: boolean
  onClose: () => void
  status: SendStatus
  addresses: UserAddress[] | undefined
  searchAddress: (req: NftSearchRequest) => Promise<UserAddressPreview[]>
  onCreateContact: (request: UserAddressSaveRequest) => Promise<void>
  onUpdateContact: (contact: UserAddressUpdateRequest) => Promise<void>
  nativeToken?: FT
  isFeeLoading?: boolean
  feeError?: string
  feeFormatted?: string
  feeFormattedUsd?: string
}

export const TransferNFTUi: FC<TransferNFTUiProps> = ({
  nfts,
  setSelectedNFTId,
  selectedNFT,
  submit,
  validateAddress,
  isSuccessOpen,
  onClose,
  status,
  addresses,
  searchAddress,
  onCreateContact,
  onUpdateContact,
  nativeToken,
  isFeeLoading,
  feeError,
  feeFormatted,
  feeFormattedUsd,
}) => {
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)
  const [isCreateAddressBookModalOpen, setIsCreateAddressBookModalOpen] =
    useState(false)
  const [isUpdateAddressListModalOpen, setIsUpdateAddressListModalOpen] =
    useState(false)
  const [addressToEdit, setAddressToEdit] = useState("")

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext()
  const to = watch("to")

  const isEvmNft = selectedNFT?.getMarketPlace() === MarketPlace.EVM

  const addressesOptions = useMemo(
    () => getAddressBookNftOptions(addresses, isEvmNft),
    [addresses, isEvmNft],
  )

  const predefinedAddress = useMemo((): PredefinedAddress | undefined => {
    if (!to) return undefined
    if (isEvmNft) return { value: to, type: "ethWallet" }
    return { value: to, type: "icpWallet" }
  }, [to, isEvmNft])

  const contactOptionsToUpdate = useMemo(() => {
    return (addresses ?? []).filter((contact) => {
      if (isEvmNft) return !contact.evm
      return !contact.icpPrincipal
    })
  }, [addresses, isEvmNft])

  const isAddressExists = useMemo(() => {
    if (!to || !addresses) return false
    return addresses.some((contact) => {
      if (isEvmNft) return contact.evm?.toLowerCase() === to.toLowerCase()
      return contact.icpPrincipal === to
    })
  }, [to, addresses, isEvmNft])

  const availableAddressesOptions = useMemo((): IGroupedSendAddress[] => {
    return contactOptionsToUpdate.map((address) => {
      const existingAddress =
        address.icpPrincipal ??
        address.icpAccountId ??
        address.evm ??
        address.btc
      return {
        id: address.id,
        title: address.name,
        subTitle: existingAddress
          ? truncateString(existingAddress, 6, 4)
          : undefined,
        value: undefined,
      }
    })
  }, [contactOptionsToUpdate])

  const onDone = () => {
    if (isAddressExists) return onClose()
    setIsAddressBookOpen(true)
  }

  return (
    <>
      <SendSuccessUi
        title={`${selectedNFT?.getTokenName()}`}
        subTitle={`${selectedNFT?.getCollectionName()}`}
        onDone={onDone}
        assetImg={selectedNFT?.getAssetPreview()?.url ?? ""}
        isOpen={isSuccessOpen}
        status={status}
        assetImageClassname="w-[102px] h-[102px] top-[161px] sm:w-[116px] sm:h-[116px] sm:top-[154px]"
        duration={selectedNFT && "asset" in selectedNFT ? 30 : 2}
      />
      <SendAddressBook
        onClose={onClose}
        isOpen={isAddressBookOpen}
        hasContactsToUpdate={contactOptionsToUpdate.length > 0}
        setCreateContactModalOpen={setIsCreateAddressBookModalOpen}
        setUpdateContactModalOpen={setIsUpdateAddressListModalOpen}
      />
      <AddressBookModal
        mode={AddressBookAction.CREATE}
        isOpen={isCreateAddressBookModalOpen}
        onClose={() => setIsCreateAddressBookModalOpen(false)}
        onSubmit={onCreateContact}
        addresses={addresses}
        predefinedAddress={predefinedAddress}
        showBackButton
      />
      <ChooseAvailableAddressModal
        isAvailableModalVisible={isUpdateAddressListModalOpen}
        onClose={() => setIsUpdateAddressListModalOpen(false)}
        title="Add to existing contact"
        addresses={availableAddressesOptions}
        token={nativeToken}
        setSelectedAddress={setAddressToEdit}
      />
      <AddressBookModal
        mode={AddressBookAction.EDIT}
        isOpen={Boolean(addressToEdit)}
        onClose={() => setAddressToEdit("")}
        onSubmit={onUpdateContact}
        addresses={addresses}
        predefinedAddress={predefinedAddress}
        address={addresses?.find((a) => a.id === addressToEdit)}
        showBackButton
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
          addresses={addressesOptions}
          placeholder="Recipient wallet address or account ID"
          errorText={errors["to"]?.message as string}
          registerFunction={register("to", {
            required: "This field cannot be empty",
            validate: (value) => validateAddress(value),
          })}
          searchAddress={searchAddress}
          token={nativeToken}
        />
        {selectedNFT && selectedNFT.getMarketPlace() === MarketPlace.EVM && (
          <div>
            <div className="flex justify-between">
              <div className="text-xs text-gray-500 dark:text-zinc-400">
                Network fee
              </div>
              <div>
                <div className="text-right">
                  <p
                    className="text-xs leading-5 text-gray-600 dark:text-zinc-400"
                    id="fee"
                  >
                    {isFeeLoading ? (
                      <>
                        <Skeleton className="w-[80px] h-5" />
                        <span className="block mt-1 text-xs">
                          <Skeleton className="w-[60px] h-4 ml-auto" />
                        </span>
                      </>
                    ) : !feeFormatted ? null : (
                      <>
                        <span>{feeFormatted}</span>
                        {feeFormattedUsd && (
                          <span className="block mt-1 text-xs">
                            {feeFormattedUsd}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            {feeError && (
              <div className="mt-2 text-xs text-red-600">{feeError}</div>
            )}
          </div>
        )}
        <Button
          id={"sendButton"}
          disabled={
            !selectedNFT ||
            Boolean(errors["to"]?.message) ||
            !to ||
            (selectedNFT?.getMarketPlace() === MarketPlace.EVM && !feeFormatted)
          }
          className="absolute bottom-5 left-5 right-5 !w-auto"
          type="primary"
          block
          onClick={handleSubmit(submit)}
          icon={
            isFeeLoading && !feeError ? (
              <Spinner className="w-5 h-5 text-white" />
            ) : (
              <IconCmpArrow className="rotate-[135deg] !max-w-5 !max-h-5" />
            )
          }
        >
          Send
        </Button>
      </div>
    </>
  )
}
