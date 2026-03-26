import toaster from "packages/ui/src/atoms/toast"
import { TransferNFTUi } from "packages/ui/src/organisms/send-receive/components/send-nft"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useSWR, useSWRWithTimestamp } from "@nfid/swr"

import { fetchNFT, fetchNFTs } from "frontend/features/collectibles/utils/util"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useEthAddress } from "frontend/hooks"
import { useIdentity } from "frontend/hooks/identity"
import { transferEXT } from "frontend/integration/entrepot/ext"
import { isAddress } from "ethers"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

import { FormValues, SendStatus } from "../types"
import {
  getAddressBookNftOptions,
  validateETHAddress,
  validateNftAddress,
} from "../utils"
import {
  addressBookFacade,
  NftSearchRequest,
} from "frontend/integration/address-book"
import { FormProvider, useForm } from "react-hook-form"
import { FeeResponse, FeeResponseETH } from "frontend/integration/ft/utils"
import { Category, ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { MarketPlace } from "frontend/integration/nft/enum/enums"
import {
  EvmNftStandard,
  EVMService,
} from "frontend/integration/ethereum/evm.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { baseService } from "frontend/integration/ethereum/base/base.service"
import { arbitrumService } from "frontend/integration/ethereum/arbitrum/arbitrum.service"
import { polygonService } from "frontend/integration/ethereum/polygon/polygon.service"
import { ethSepoliaService } from "frontend/integration/ethereum/eth/testnetwork/eth-sepolia.service"
import { baseSepoliaService } from "frontend/integration/ethereum/base/testnetwork/base-sepolia.service"
import { arbSepoliaService } from "frontend/integration/ethereum/arbitrum/testnetwork/arb-sepolia.service"
import { polygonAmoyService } from "frontend/integration/ethereum/polygon/testnetwork/pol-amoy.service"

const EVM_SERVICE_MAP: Partial<Record<number, EVMService>> = {
  [ChainId.ETH]: ethereumService,
  [ChainId.BASE]: baseService,
  [ChainId.ARB]: arbitrumService,
  [ChainId.POL]: polygonService,
  [ChainId.ETH_SEPOLIA]: ethSepoliaService,
  [ChainId.BASE_SEPOLIA]: baseSepoliaService,
  [ChainId.ARB_SEPOLIA]: arbSepoliaService,
  [ChainId.POL_AMOY]: polygonAmoyService,
}

interface ITransferNFT {
  preselectedNFTId?: string
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
}

export const TransferNFT = ({
  preselectedNFTId = "",
  onClose,
  setErrorMessage,
  setSuccessMessage,
}: ITransferNFT) => {
  const [selectedNFTId, setSelectedNFTId] = useState(preselectedNFTId)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const { identity } = useIdentity()
  const { ethAddress } = useEthAddress()
  const [fee, setFee] = useState<FeeResponse | undefined>()
  const [isFeeLoading, setIsFeeLoading] = useState(false)
  const [feeError, setFeeError] = useState<string | undefined>()

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      to: "",
    },
  })

  const { watch } = formMethods
  const to = watch("to")

  const { data: addresses } = useSWR("addressBook", async () =>
    addressBookFacade.findAll(),
  )

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })
  const { initedTokens } = useTokensInit(tokens)

  const { data: nfts, isLoading: isNftListLoading } = useSWR(
    "nftList",
    () => fetchNFTs(),
    { revalidateOnFocus: false },
  )

  const { data: selectedNFT, isLoading: isNftLoading } = useSWR(
    selectedNFTId ? ["nft", selectedNFTId] : null,
    ([, tokenId]: [string, string]) => fetchNFT(tokenId),
  )

  const isEvmNft = selectedNFT?.getMarketPlace() === MarketPlace.EVM

  const addressesOptions = useMemo(() => {
    return getAddressBookNftOptions(addresses, isEvmNft)
  }, [addresses, isEvmNft])

  const searchNftAddress = useCallback(
    (req: NftSearchRequest) =>
      addressBookFacade.nftSearch({ ...req, isEvm: isEvmNft }),
    [isEvmNft],
  )

  const nativeGasToken = useMemo(() => {
    if (!selectedNFT || selectedNFT.getMarketPlace() !== MarketPlace.EVM) return
    const chainId = selectedNFT.getChainId()
    return initedTokens?.find(
      (t) =>
        t.getChainId() === chainId && t.getTokenCategory() !== Category.ERC20,
    )
  }, [selectedNFT, initedTokens])

  const feeFormatted = useMemo(() => {
    if (!fee || !nativeGasToken) return undefined
    return nativeGasToken.getTokenFeeFormatted(fee.getFee())
  }, [fee, nativeGasToken])

  const feeFormattedUsd = useMemo(() => {
    if (!fee || !nativeGasToken) return undefined
    return nativeGasToken.getTokenFeeFormattedUsd(fee.getFee()) ?? undefined
  }, [fee, nativeGasToken])

  useEffect(() => {
    setSelectedNFTId(preselectedNFTId)
  }, [preselectedNFTId])

  useEffect(() => {
    setFee(undefined)
    setFeeError(undefined)
  }, [selectedNFT])

  useEffect(() => {
    if (!selectedNFT || selectedNFT.getMarketPlace() !== MarketPlace.EVM) return
    if (!to || !isAddress(to) || !ethAddress) return

    const chainId = selectedNFT.getChainId()
    const service = EVM_SERVICE_MAP[chainId]
    if (!service) return

    const tokenParts = selectedNFT.getTokenId().split(":")
    const nftAsset = {
      contract: selectedNFT.getCollectionId(),
      tokenId: tokenParts[tokenParts.length - 1],
      type: selectedNFT.getNftStandard() as EvmNftStandard,
    }

    let isCancelled = false
    setFee(undefined)
    setFeeError(undefined)
    setIsFeeLoading(true)

    const fetchFee = async () => {
      try {
        const sendEthFee = await service.getNFTTransferFee(
          ethAddress,
          to,
          nftAsset,
        )
        if (!isCancelled) setFee(new FeeResponseETH(sendEthFee))
      } catch (e) {
        console.error(`Fee error: ${e}`)
        if (!isCancelled) {
          setFeeError((e as Error).message)
          setFee(undefined)
        }
      } finally {
        if (!isCancelled) setIsFeeLoading(false)
      }
    }

    fetchFee()

    return () => {
      isCancelled = true
    }
  }, [selectedNFT, to, ethAddress])

  const submit = useCallback(
    async (values: { to: string }) => {
      if (!selectedNFT) return toaster.error("No selected NFT")
      if (!identity) return toaster.error("No Identity found")
      if (selectedNFT.getMarketPlace() === MarketPlace.EVM) {
        if (!fee) return toaster.error("Fee not calculated")
        if (!ethAddress) return toaster.error("No Ethereum address found")

        const chainId = selectedNFT.getChainId()
        const service = EVM_SERVICE_MAP[chainId]
        if (!service) return toaster.error("Unsupported chain")

        const tokenParts = selectedNFT.getTokenId().split(":")
        const nftAsset = {
          contract: selectedNFT.getCollectionId(),
          tokenId: tokenParts[tokenParts.length - 1],
          type: selectedNFT.getNftStandard() as EvmNftStandard,
        }

        const ethFee = fee as FeeResponseETH

        setIsSuccessOpen(true)

        service
          .sendNFTTransaction(identity, values.to, nftAsset, {
            gasUsed: ethFee.getGasUsed(),
            maxFeePerGas: ethFee.getMaxFeePerGas(),
            maxPriorityFeePerGas: ethFee.getMaxPriorityFeePerGas(),
            baseFeePerGas: ethFee.getBaseFeePerGas(),
          })
          .then(() => {
            setSuccessMessage(
              `Transaction ${selectedNFT.getTokenName()} successful`,
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

        return
      }

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
    [
      selectedNFT,
      fee,
      ethAddress,
      setErrorMessage,
      setSuccessMessage,
      identity,
    ],
  )

  const validateAddress = useMemo(() => {
    if (selectedNFT?.getMarketPlace() === MarketPlace.EVM) {
      return validateETHAddress
    }
    return validateNftAddress
  }, [selectedNFT])

  return (
    <FormProvider {...formMethods}>
      <TransferNFTUi
        isLoading={isNftLoading && isNftListLoading}
        loadingMessage={"Loading NFTs..."}
        nfts={nfts?.items}
        setSelectedNFTId={setSelectedNFTId}
        selectedNFT={selectedNFT}
        submit={submit}
        validateAddress={validateAddress}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        status={status}
        addresses={addressesOptions}
        searchAddress={searchNftAddress}
        nativeToken={nativeGasToken}
        isFeeLoading={isFeeLoading}
        feeError={feeError}
        feeFormatted={feeFormatted}
        feeFormattedUsd={feeFormattedUsd}
      />
    </FormProvider>
  )
}
