import debounce from "lodash/debounce"
import { type LiFiStep } from "@lifi/sdk"
import {
  BridgeUi,
  EstimatedBridge,
} from "packages/ui/src/organisms/send-receive/components/bridge"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ETH_NATIVE_ID, EVM_NATIVE } from "@nfid/integration/token/constants"
import { mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { authState } from "@nfid/integration"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { FormValues, SelectedToken, SendStatus } from "../types"
import {
  getTokensWithUpdatedBalance,
  getUpdatedInitedTokens,
  isTokenWithBalance,
  mutateTokensCacheMergingBalances,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { ChainId, isEvmToken } from "@nfid/integration/token/icrc1/enum/enums"
import { bridgeService } from "frontend/integration/ethereum/bridge/bridge.service"
import { Principal } from "@icp-sdk/core/principal"

interface BridgeProps {
  preselectedSourceTokenAddress: string | undefined
  preselectedSourceChainId?: ChainId
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  setIsBridgeSuccess: (value: boolean) => void
  onError: (value: boolean) => void
}

const DEFAULT_BRIDGE_ERROR = "Something went wrong"

export const Bridge = ({
  preselectedSourceTokenAddress,
  preselectedSourceChainId,
  onClose,
  setErrorMessage,
  setSuccessMessage,
  setIsBridgeSuccess,
  onError,
}: BridgeProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [bridgeData, setBridgeData] = useState<EstimatedBridge>()
  const [pendingQuote, setPendingQuote] = useState<LiFiStep>()
  const [isFetchingBridgeData, setIsFetchingBridgeData] = useState(false)
  const [bridgeError, setBridgeError] = useState<string | undefined>()
  const [fromTokenAddress, setFromTokenAddress] = useState(
    preselectedSourceTokenAddress || ETH_NATIVE_ID,
  )
  const [fromChainId, setFromChainId] = useState<ChainId | undefined>(
    preselectedSourceChainId,
  )
  const { identity } = useIdentity()
  const [toTokenAddress, setToTokenAddress] = useState(
    preselectedSourceTokenAddress ?? ETH_NATIVE_ID,
  )
  const [toChainId, setToChainId] = useState<ChainId | undefined>()

  const setFromChosenToken = useCallback(
    ({ address, chainId }: SelectedToken) => {
      setFromTokenAddress(address)
      setFromChainId(chainId)
    },
    [],
  )

  const setToChosenToken = useCallback(
    ({ address, chainId }: SelectedToken) => {
      setToTokenAddress(address)
      setToChainId(chainId)
    },
    [],
  )

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const allEvmTokens = useMemo(() => {
    return tokens.filter((t) => isEvmToken(t.getChainId()))
  }, [tokens])

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const { data: filteredFromTokens, isLoading: isFilteredTokensLoading } =
    useSWRWithTimestamp(
      initedTokens ? "filteredFromTokens" : null,
      async () => {
        const tokens = await bridgeService.getSupportedSourceTokens(
          initedTokens!,
        )
        if (!tokens) return

        return tokens.filter((t) => isTokenWithBalance(t))
      },
      { revalidateOnFocus: false },
    )

  const fromToken = useMemo(() => {
    if (!filteredFromTokens) return
    return filteredFromTokens.find(
      (token: FT) =>
        token.getTokenAddress() === fromTokenAddress &&
        (fromChainId === undefined || token.getChainId() === fromChainId),
    )
  }, [fromTokenAddress, fromChainId, filteredFromTokens])

  const fromTokenId = fromToken
    ? `${fromToken.getChainId()}:${fromToken.getTokenAddress()}`
    : null

  const { data: filteredToTokens } = useSWRWithTimestamp(
    allEvmTokens.length && fromTokenId
      ? ["filteredToTokens", fromTokenId]
      : null,
    () => bridgeService.getSupportedTargetTokens(allEvmTokens, fromToken),
    { revalidateOnFocus: false },
  )

  const toToken = useMemo(() => {
    if (!filteredToTokens) return
    return filteredToTokens.find(
      (token: FT) =>
        token.getTokenAddress() === toTokenAddress &&
        (toChainId === undefined || token.getChainId() === toChainId),
    )
  }, [toTokenAddress, toChainId, filteredToTokens])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  const handleReverse = useCallback(async () => {
    if (!toToken) return

    let initedToToken: FT
    if (toToken.isInited()) {
      initedToToken = toToken
    } else {
      const { publicKey } = authState.getUserIdData()
      initedToToken = await toToken.init(Principal.fromText(publicKey))
    }

    const already = filteredFromTokens?.some(
      (t) =>
        t.getTokenAddress() === initedToToken.getTokenAddress() &&
        t.getChainId() === initedToToken.getChainId(),
    )
    if (!already) {
      mutateWithTimestamp(
        "filteredFromTokens",
        [...(filteredFromTokens ?? []), initedToToken],
        false,
      )
    }

    setFromTokenAddress(toTokenAddress)
    setFromChainId(initedToToken.getChainId())
    setToTokenAddress(fromTokenAddress)
    setToChainId(fromChainId)
    setBridgeData(undefined)
    formMethods.setValue("amount", "")
  }, [
    fromTokenAddress,
    toTokenAddress,
    fromChainId,
    toToken,
    filteredFromTokens,
    formMethods,
  ])

  useEffect(() => {
    if (!filteredToTokens?.length) return
    const isCurrentValid = filteredToTokens.some(
      (t) =>
        t.getTokenAddress() === toTokenAddress &&
        (toChainId === undefined || t.getChainId() === toChainId),
    )
    if (isCurrentValid) return
    setToTokenAddress(filteredToTokens[0].getTokenAddress())
    setToChainId(filteredToTokens[0].getChainId())
  }, [fromToken, filteredToTokens])

  useEffect(() => {
    setBridgeError(undefined)
    formMethods.setValue("amount", "")
    setBridgeData(undefined)
    setPendingQuote(undefined)
    setIsFetchingBridgeData(false)
  }, [fromToken, toToken, formMethods])

  useEffect(() => {
    onError(Boolean(bridgeError))
  }, [bridgeError, onError])

  const { watch } = formMethods
  const amount = watch("amount")

  const parsedAmount = Number(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  const hasAmountError = !!formMethods.formState.errors.amount
  const isMaxAmountRef = useRef(false)

  const onMaxResolved = useCallback(() => {
    isMaxAmountRef.current = true
  }, [])

  const fetchGenRef = useRef(0)

  const debouncedFetchFee = useMemo(
    () =>
      debounce(async (fromTokenChain, toTokenChain, amount) => {
        const isMaxAmount = isMaxAmountRef.current
        isMaxAmountRef.current = false

        const gen = fetchGenRef.current

        try {
          if (!fromToken || !toToken || !identity) return
          setBridgeData(undefined)
          setPendingQuote(undefined)
          setBridgeError(undefined)
          setIsFetchingBridgeData(true)

          const { estimate, quote } = await bridgeService.getQuote(
            fromTokenChain,
            toTokenChain,
            fromToken.getTokenAddress(),
            toToken.getTokenAddress(),
            amount,
            fromToken.getTokenDecimals(),
            isMaxAmount,
          )

          if (fetchGenRef.current !== gen) return
          setBridgeData(estimate)
          setPendingQuote(quote)
          setIsFetchingBridgeData(false)
        } catch (e) {
          if (fetchGenRef.current !== gen) return
          setIsFetchingBridgeData(false)
          console.error(`Bridge fee error: ${e}`)
          const message = (e as Error).message ?? ""
          setBridgeError(
            message.includes("404") || message.includes("No available quotes")
              ? "No route available for this token pair"
              : message,
          )
          setBridgeData(undefined)
        }
      }, 1000),
    [identity, fromToken, toToken],
  )

  useEffect(() => {
    if (!isAmountValid || !fromToken || !toToken || hasAmountError) return

    debouncedFetchFee(fromToken.getChainId(), toToken?.getChainId(), amount)

    return () => {
      fetchGenRef.current++
      debouncedFetchFee.cancel()
    }
  }, [
    identity,
    amount,
    isAmountValid,
    hasAmountError,
    fromToken,
    toToken,
    debouncedFetchFee,
  ])

  const isSubmittingRef = useRef(false)

  const submit = useCallback(() => {
    if (!identity || !fromToken || !toToken || !pendingQuote) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    setIsSuccessOpen(true)
    setIsBridgeSuccess(true)

    bridgeService
      .bridge(pendingQuote)
      .then(() => {
        setSuccessMessage(
          `Bridge ${amount} ${fromToken.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        if (!initedTokens) return

        const isFromNative =
          fromTokenAddress === EVM_NATIVE || fromTokenAddress === ETH_NATIVE_ID

        const updatedTokens = getTokensWithUpdatedBalance(
          [
            {
              address: fromTokenAddress,
              chainId: fromToken.getChainId(),
              amount,
              decimals: fromToken.getTokenDecimals(),
              fee: isFromNative ? bridgeData?.rawFee : BigInt(0),
            },
          ],
          initedTokens,
        )
        mutateTokensCacheMergingBalances(updatedTokens)
        mutateInitedTokens(updatedTokens, false)

        toToken
          .showToken()
          .then(async () => {
            const { publicKey } = authState.getUserIdData()
            await toToken.init(Principal.fromText(publicKey))
            await getUpdatedInitedTokens(tokens)
          })
          .catch(console.debug)
      })
      .catch((error) => {
        console.error(
          `Bridge error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_BRIDGE_ERROR)
        setStatus(SendStatus.FAILED)
        setError(error)
      })
      .finally(() => {
        isSubmittingRef.current = false
      })
  }, [
    identity,
    fromToken,
    toToken,
    pendingQuote,
    amount,
    toTokenAddress,
    fromTokenAddress,
    setErrorMessage,
    setSuccessMessage,
    initedTokens,
    setIsBridgeSuccess,
    mutateInitedTokens,
  ])

  return (
    <>
      <FormProvider {...formMethods}>
        <BridgeUi
          toToken={toToken}
          fromToken={fromToken}
          isTokenLoading={isTokensLoading || isFilteredTokensLoading}
          setFromChosenToken={setFromChosenToken}
          setToChosenToken={setToChosenToken}
          submit={submit}
          isSuccessOpen={isSuccessOpen}
          onClose={onClose}
          handleReverse={handleReverse}
          bridgeData={bridgeData}
          isBridgeDataLoading={isFetchingBridgeData}
          status={status}
          error={error}
          bridgeError={bridgeError}
          tokens={filteredFromTokens}
          toTokens={filteredToTokens}
          onMaxResolved={onMaxResolved}
        />
      </FormProvider>
    </>
  )
}
