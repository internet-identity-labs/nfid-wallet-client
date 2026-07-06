import debounce from "lodash/debounce"

import { EarnUi } from "packages/ui/src/organisms/send-receive/components/earn"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ETH_NATIVE_ID, EVM_NATIVE } from "@nfid/integration/token/constants"
import { useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { FormValues, SelectedToken, SendStatus } from "../types"
import {
  getTokensWithUpdatedBalance,
  getUpdatedPositions,
  mutateTokensCacheMergingBalances,
  isInsufficientEthForGas,
  INSUFFICIENT_ETH_FOR_GAS_ERROR,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import {
  AaveFeeData,
  aaveService,
  AaveSupportedChainId,
  WRAPPED_NATIVE_TOKEN,
} from "frontend/integration/aave"
import { useSupplyPositions } from "frontend/hooks"

interface EarnProps {
  preselectedSourceTokenAddress: string | undefined
  preselectedSourceChainId?: ChainId
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  setIsEarnSuccess: (value: boolean) => void
  onError: (value: boolean) => void
  isUpdate?: boolean
}

const DEFAULT_EARN_ERROR = "Something went wrong"

export const Earn = ({
  preselectedSourceTokenAddress,
  preselectedSourceChainId,
  onClose,
  setErrorMessage,
  setSuccessMessage,
  setIsEarnSuccess,
  onError,
  isUpdate,
}: EarnProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [earnFeeData, setEarnFeeData] = useState<AaveFeeData | undefined>()
  const [apy, setApy] = useState<string | undefined>()
  const [isFetchingEarnData, setIsFetchingEarnData] = useState(false)
  const [earnError, setEarnError] = useState<string | undefined>()
  const [tokenAddress, setTokenAddress] = useState(
    preselectedSourceTokenAddress || ETH_NATIVE_ID,
  )
  const [chainId, setChainId] = useState<ChainId | undefined>(
    preselectedSourceChainId,
  )
  const { identity } = useIdentity()
  const isSubmittingRef = useRef(false)
  const isMaxAmountRef = useRef(false)
  const fetchGenRef = useRef(0)

  const setChosenToken = useCallback(({ address, chainId }: SelectedToken) => {
    setTokenAddress(address)
    setChainId(chainId)
  }, [])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const { earnPositions, supportedTokens } = useSupplyPositions(initedTokens)

  const token = useMemo(() => {
    if (!supportedTokens) return
    return supportedTokens.find(
      (token: FT) =>
        token.getTokenAddress() === tokenAddress &&
        (chainId === undefined || token.getChainId() === chainId),
    )
  }, [tokenAddress, chainId, supportedTokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  useEffect(() => {
    setEarnError(undefined)
    formMethods.setValue("amount", "")
    setEarnFeeData(undefined)
    setIsFetchingEarnData(false)
  }, [token, formMethods])

  useEffect(() => {
    onError(Boolean(earnError))
  }, [earnError, onError])

  const { watch } = formMethods
  const amount = watch("amount")

  const parsedAmount = Number(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  const hasAmountError = !!formMethods.formState.errors.amount

  const onMaxResolved = useCallback(() => {
    isMaxAmountRef.current = true
  }, [])

  const debouncedFetchFee = useMemo(
    () =>
      debounce(
        async (
          chainId: AaveSupportedChainId,
          tokenAddress: string,
          amount: string,
          decimals: number,
        ) => {
          const isMaxAmount = isMaxAmountRef.current
          isMaxAmountRef.current = false

          const tokenAddressFormatted =
            tokenAddress === EVM_NATIVE || tokenAddress === ETH_NATIVE_ID
              ? WRAPPED_NATIVE_TOKEN[chainId]
              : tokenAddress

          const gen = fetchGenRef.current

          try {
            if (!identity) return
            setEarnFeeData(undefined)
            setEarnError(undefined)
            setIsFetchingEarnData(true)

            const [earnFee, reserveData] = await Promise.all([
              aaveService.estimateSupplyFee(
                identity,
                decimals,
                {
                  chainId,
                  asset: tokenAddressFormatted,
                  amount,
                  isNativeToken:
                    tokenAddress === ETH_NATIVE_ID ||
                    tokenAddress === EVM_NATIVE,
                },
                isMaxAmount,
              ),
              aaveService.getReserveData(chainId, tokenAddressFormatted),
            ])

            const apyData = aaveService.getSupplyAPY(
              reserveData.currentLiquidityRate,
            )

            setApy(apyData)
            if (fetchGenRef.current !== gen) return
            setEarnFeeData(earnFee)
            setIsFetchingEarnData(false)
          } catch (e) {
            if (fetchGenRef.current !== gen) return
            setIsFetchingEarnData(false)
            console.error(`Earn fee error: ${e}`)
            const message = (e as Error).message ?? ""
            setEarnError(message)
            setEarnFeeData(undefined)
          }
        },
        1000,
      ),
    [identity],
  )

  useEffect(() => {
    if (!isAmountValid || !token || hasAmountError) return

    debouncedFetchFee(
      token.getChainId() as AaveSupportedChainId,
      token.getTokenAddress(),
      amount,
      token.getTokenDecimals(),
    )

    return () => {
      fetchGenRef.current++
      debouncedFetchFee.cancel()
    }
  }, [
    identity,
    amount,
    isAmountValid,
    hasAmountError,
    token,
    debouncedFetchFee,
  ])

  const submit = useCallback(() => {
    if (!identity || !token || !earnFeeData) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    setIsSuccessOpen(true)
    setIsEarnSuccess(true)

    const isNativeToken =
      tokenAddress === EVM_NATIVE || tokenAddress === ETH_NATIVE_ID
    // when supplying the max balance of a native token, use the gas-reserved
    // amount computed during fee estimation instead of the raw form value
    const supplyAmount = earnFeeData.adjustedAmount ?? amount

    aaveService
      .supply(
        identity,
        token.getTokenDecimals(),
        {
          chainId: token.getChainId() as AaveSupportedChainId,
          asset: token.getTokenAddress(),
          amount: supplyAmount,
          isNativeToken,
        },
        earnFeeData.rawFee,
      )
      .then(() => {
        setSuccessMessage(
          `Supply ${supplyAmount} ${token.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        if (!initedTokens) return

        const updatedTokens = getTokensWithUpdatedBalance(
          [
            {
              address: tokenAddress,
              chainId: token.getChainId(),
              amount: supplyAmount,
              decimals: token.getTokenDecimals(),
              fee: isNativeToken ? earnFeeData.rawFee.networkFee : undefined,
            },
          ],
          initedTokens,
        )
        mutateTokensCacheMergingBalances(updatedTokens)
        mutateInitedTokens(updatedTokens, false)

        const assetForPosition = (
          isNativeToken
            ? WRAPPED_NATIVE_TOKEN[token.getChainId() as AaveSupportedChainId]
            : token.getTokenAddress()
        ).toLowerCase()

        getUpdatedPositions(
          earnPositions,
          assetForPosition,
          token.getChainId() as AaveSupportedChainId,
          supplyAmount,
          false,
          token,
          { apy },
        )
      })
      .catch((error) => {
        console.error(
          `Earn error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        const errorMessage = isInsufficientEthForGas(error)
          ? INSUFFICIENT_ETH_FOR_GAS_ERROR
          : DEFAULT_EARN_ERROR
        setErrorMessage(errorMessage)
        setStatus(SendStatus.FAILED)
        setError(errorMessage)
      })
      .finally(() => {
        isSubmittingRef.current = false
      })
  }, [
    identity,
    token,
    amount,
    tokenAddress,
    setErrorMessage,
    setSuccessMessage,
    initedTokens,
    setIsEarnSuccess,
    mutateInitedTokens,
    earnFeeData,
    earnPositions,
    apy,
  ])

  return (
    <>
      <FormProvider {...formMethods}>
        <EarnUi
          token={token}
          isTokenLoading={isTokensLoading || !supportedTokens}
          setChosenToken={setChosenToken}
          submit={submit}
          isSuccessOpen={isSuccessOpen}
          onClose={onClose}
          earnFeeData={earnFeeData}
          apy={apy}
          isEarnDataLoading={isFetchingEarnData}
          status={status}
          error={error}
          earnError={earnError}
          tokens={supportedTokens}
          onMaxResolved={onMaxResolved}
          isUpdate={isUpdate}
        />
      </FormProvider>
    </>
  )
}
