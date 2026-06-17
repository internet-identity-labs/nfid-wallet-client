import debounce from "lodash/debounce"
import { WithdrawUi } from "packages/ui/src/organisms/send-receive/components/withdraw"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ETH_NATIVE_ID, EVM_NATIVE } from "@nfid/integration/token/constants"
import { useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { FormValues, SendStatus } from "../types"
import {
  getTokensWithUpdatedBalance,
  getUpdatedPositions,
  mutateTokensCacheMergingBalances,
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

interface WithdrawProps {
  tokenAddress: string
  chainId: ChainId
  balance: bigint
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  setIsWithdrawSuccess: (value: boolean) => void
  onError: (value: boolean) => void
}

const DEFAULT_EARN_ERROR = "Something went wrong"

export const Withdraw = ({
  tokenAddress,
  chainId,
  balance,
  onClose,
  setErrorMessage,
  setSuccessMessage,
  setIsWithdrawSuccess,
  onError,
}: WithdrawProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [withdrawFeeData, setWithdrawFeeData] = useState<
    { data: AaveFeeData; isMaxAmount: boolean } | undefined
  >()
  const [isFetchingWithdrawData, setIsFetchingWithdrawData] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | undefined>()
  const { identity } = useIdentity()
  const isMaxAmountRef = useRef(false)
  const fetchGenRef = useRef(0)

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
    onError(Boolean(withdrawError))
  }, [withdrawError, onError])

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
            setWithdrawFeeData(undefined)
            setWithdrawError(undefined)
            setIsFetchingWithdrawData(true)

            const withdrawFee = await aaveService.estimateWithdrawFee(
              identity,
              decimals,
              {
                chainId,
                asset: tokenAddressFormatted,
                amount: isMaxAmount ? "max" : amount,
                isNativeToken:
                  tokenAddress === ETH_NATIVE_ID || tokenAddress === EVM_NATIVE,
              },
            )

            if (fetchGenRef.current !== gen) return
            setWithdrawFeeData({ data: withdrawFee, isMaxAmount })
            setIsFetchingWithdrawData(false)
          } catch (e) {
            if (fetchGenRef.current !== gen) return
            setIsFetchingWithdrawData(false)
            console.error(`Withdraw fee error: ${e}`)
            const message = (e as Error).message ?? ""
            setWithdrawError(message)
            setWithdrawFeeData(undefined)
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

  const isSubmittingRef = useRef(false)

  const submit = useCallback(() => {
    if (!identity || !token || !withdrawFeeData) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSuccessOpen(true)
    setIsWithdrawSuccess(true)

    const isNativeToken =
      tokenAddress === EVM_NATIVE || tokenAddress === ETH_NATIVE_ID

    aaveService
      .withdraw(
        identity,
        token.getTokenDecimals(),
        {
          chainId: token.getChainId() as AaveSupportedChainId,
          asset: token.getTokenAddress(),
          amount: withdrawFeeData.isMaxAmount ? "max" : amount,
          isNativeToken,
        },
        withdrawFeeData.data.rawFee,
      )
      .then(() => {
        setSuccessMessage(
          `Withdraw ${amount} ${token.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)

        const assetForPosition = (
          tokenAddress === EVM_NATIVE || tokenAddress === ETH_NATIVE_ID
            ? WRAPPED_NATIVE_TOKEN[token.getChainId() as AaveSupportedChainId]
            : token.getTokenAddress()
        ).toLowerCase()

        getUpdatedPositions(
          earnPositions,
          assetForPosition,
          token.getChainId() as AaveSupportedChainId,
          amount,
          withdrawFeeData.isMaxAmount,
          token,
        )

        if (!initedTokens) return

        const updatedTokens = getTokensWithUpdatedBalance(
          [
            {
              address: tokenAddress,
              chainId: token.getChainId(),
              amount,
              decimals: token.getTokenDecimals(),
              fee: isNativeToken
                ? withdrawFeeData.data.rawFee.networkFee
                : undefined,
              add: true,
            },
          ],
          initedTokens,
        )
        mutateTokensCacheMergingBalances(updatedTokens)
        mutateInitedTokens(updatedTokens, false)
      })
      .catch((error) => {
        console.error(
          `Withdraw error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_EARN_ERROR)
        setStatus(SendStatus.FAILED)
        setError(error)
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
    setIsWithdrawSuccess,
    mutateInitedTokens,
    withdrawFeeData,
    earnPositions,
  ])

  return (
    <>
      <FormProvider {...formMethods}>
        <WithdrawUi
          token={token}
          isTokenLoading={isTokensLoading || !supportedTokens}
          submit={submit}
          isSuccessOpen={isSuccessOpen}
          onClose={onClose}
          withdrawFeeData={withdrawFeeData?.data}
          isWithdrawDataLoading={isFetchingWithdrawData}
          status={status}
          error={error}
          withdrawError={withdrawError}
          onMaxResolved={onMaxResolved}
          balance={balance}
        />
      </FormProvider>
    </>
  )
}
