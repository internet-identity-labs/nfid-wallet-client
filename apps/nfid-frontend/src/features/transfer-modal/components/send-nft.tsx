import { useCallback, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { useSWR } from "@nfid/swr"
import toaster from "@nfid/ui/atoms/toast"
import { TransferNFTUi } from "@nfid/ui/organisms/send-receive/components/send-nft"

import { fetchNFT, fetchNFTs } from "frontend/features/collectibles/utils/util"
import { useIdentity } from "frontend/hooks/identity"
import {
  addressBookFacade,
  NftSearchRequest,
} from "frontend/integration/address-book"
import { transferEXT } from "frontend/integration/entrepot/ext"

import { FormValues, SendStatus } from "../types"
import { getAddressBookNftOptions, validateNftAddress } from "../utils"

interface ITransferNFT {
  preselectedNFTId?: string
  selectedReceiverWallet?: string
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const TransferNFT = ({
  selectedReceiverWallet,
  preselectedNFTId = "",
  onClose,
  setErrorMessage,
  setSuccessMessage,
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState(preselectedNFTId)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const { identity } = useIdentity()

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      to: "",
    },
  })

  const { data: addresses } = useSWR("addressBook", async () =>
    addressBookFacade.findAll(),
  )

  const addressesOptions = useMemo(() => {
    return getAddressBookNftOptions(addresses)
  }, [addresses])

  const searchNftAddress = async (req: NftSearchRequest) => {
    return addressBookFacade.nftSearch(req)
  }

  useEffect(() => {
    setSelectedNFTId(preselectedNFTId)
  }, [preselectedNFTId])

  const { data: nfts, isLoading: isNftListLoading } = useSWR(
    "nftList",
    () => fetchNFTs(),
    { revalidateOnFocus: false },
  )

  const { data: selectedNFT, isLoading: isNftLoading } = useSWR(
    selectedNFTId ? ["nft", selectedNFTId] : null,
    ([, tokenId]: [string, string]) => fetchNFT(tokenId),
  )

  const submit = useCallback(
    async (values: { to: string }) => {
      if (!selectedNFT) return toaster.error("No selected NFT")
      if (!identity) return toaster.error("No Identity found")

      setIsSuccessOpen(true)

      transferEXT(selectedNFT.getTokenId(), identity, values.to)
        .then(() => {
          setSuccessMessage(
            `Transaction ${selectedNFT?.getTokenName()} successful`,
          )
          setStatus(SendStatus.COMPLETED)
        })
        .catch((e) => {
          console.error(
            `Transfer error: ${
              (e as Error).message ? (e as Error).message : e
            }`,
          )
          setErrorMessage("Something went wrong")
          setStatus(SendStatus.FAILED)
        })
    },
    [selectedNFT, setErrorMessage, setSuccessMessage, identity],
  )

  return (
    <FormProvider {...formMethods}>
      <TransferNFTUi
        isLoading={isNftLoading && isNftListLoading}
        loadingMessage={"Loading NFTs..."}
        nfts={nfts?.items}
        setSelectedNFTId={setSelectedNFTId}
        selectedNFT={selectedNFT}
        selectedReceiverWallet={selectedReceiverWallet}
        submit={submit}
        validateAddress={validateNftAddress}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        status={status}
        addresses={addressesOptions}
        searchAddress={searchNftAddress}
      />
    </FormProvider>
  )
}
