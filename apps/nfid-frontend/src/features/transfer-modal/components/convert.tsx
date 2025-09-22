import debounce from "lodash/debounce"
import { ConvertUi } from "packages/ui/src/organisms/send-receive/components/convert"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_CANISTER_ID,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"
import { mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useEthAddress } from "frontend/hooks"
import { useIdentity } from "frontend/hooks/identity"
import {
  bitcoinService,
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "frontend/integration/bitcoin/bitcoin.service"
import {
  CkEthToEthFee,
  ethereumService,
  EthToCkEthFee,
} from "frontend/integration/ethereum/ethereum.service"
import { FT } from "frontend/integration/ft/ft"

import { FormValues, SendStatus } from "../types"
import {
  getConversionTokenAddress,
  getTokensWithUpdatedBalance,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

interface ConvertBTCProps {
  preselectedSourceTokenAddress: string | undefined
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  setIsConvertSuccess: (value: boolean) => void
  onError: (value: boolean) => void
}

const DEFAULT_CONVERT_ERROR = "Something went wrong"

export const ConvertBTC = ({
  preselectedSourceTokenAddress,
  onClose,
  setErrorMessage,
  setSuccessMessage,
  setIsConvertSuccess,
  onError,
}: ConvertBTCProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [btcFee, setBtcFee] = useState<BtcToCkBtcFee | CkBtcToBtcFee>()
  const [ethFee, setEthFee] = useState<CkEthToEthFee | EthToCkEthFee>()
  const [conversionError, setConversionError] = useState<string | undefined>()

  const [fromTokenAddress, setFromTokenAddress] = useState(
    preselectedSourceTokenAddress || BTC_NATIVE_ID,
  )
  const { identity } = useIdentity()

  const [toTokenAddress, setToTokenAddress] = useState(
    getConversionTokenAddress(preselectedSourceTokenAddress ?? BTC_NATIVE_ID),
  )
  const { ethAddress } = useEthAddress()

  const handleReverse = useCallback(() => {
    setFromTokenAddress(toTokenAddress)
    setToTokenAddress(fromTokenAddress)
  }, [fromTokenAddress, toTokenAddress])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const tokensToConvert = useMemo(() => {
    return tokens.filter((t) => {
      return (
        t.getTokenAddress() === ETH_NATIVE_ID ||
        t.getTokenAddress() === BTC_NATIVE_ID ||
        t.getTokenAddress() === CKETH_CANISTER_ID ||
        t.getTokenAddress() === CKBTC_CANISTER_ID
      )
    })
  }, [tokens])

  const initedTokens = useTokensInit(tokensToConvert)

  useEffect(() => {
    setToTokenAddress(getConversionTokenAddress(fromTokenAddress))
  }, [fromTokenAddress])

  const fromToken = useMemo(() => {
    if (!initedTokens) return
    return initedTokens.find(
      (token: FT) => token.getTokenAddress() === fromTokenAddress,
    )
  }, [fromTokenAddress, initedTokens])

  const toToken = useMemo(() => {
    if (!initedTokens) return
    return initedTokens.find(
      (token: FT) => token.getTokenAddress() === toTokenAddress,
    )
  }, [toTokenAddress, initedTokens])

  useEffect(() => {
    setConversionError(undefined)
  }, [fromTokenAddress, toTokenAddress])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  useEffect(() => {
    onError(Boolean(setConversionError))
  }, [conversionError, onError])

  const { watch } = formMethods
  const amount = watch("amount")

  const parsedAmount = Number(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  const hasAmountError = !!formMethods.formState.errors.amount

  const debouncedFetchFee = useMemo(
    () =>
      debounce(async (identity, tokenAddress, amount) => {
        if (
          tokenAddress === BTC_NATIVE_ID ||
          tokenAddress === CKBTC_CANISTER_ID
        ) {
          setBtcFee(undefined)

          try {
            const fee =
              tokenAddress === BTC_NATIVE_ID
                ? await bitcoinService.getBtcToCkBtcFee(identity, amount)
                : await bitcoinService.getCkBtcToBtcFee(identity, amount)

            setBtcFee(fee)
          } catch (e) {
            console.error(`BTC error: ${e}`)
            setConversionError((e as Error).message)
            setBtcFee(undefined)
          }
        } else {
          setEthFee(undefined)
          setConversionError(undefined)
          try {
            const fee =
              tokenAddress === ETH_NATIVE_ID
                ? await ethereumService.getEthToCkEthFee(identity, amount)
                : await ethereumService.getCkEthToEthFee(ethAddress, amount)

            setEthFee(fee)
          } catch (e) {
            console.error(`ETH error: ${e}`)
            setConversionError((e as Error).message)
            setEthFee(undefined)
          }
        }
      }, 1000),
    [ethAddress],
  )

  useEffect(() => {
    if (!identity || !isAmountValid || !fromToken || hasAmountError) return

    debouncedFetchFee(identity, fromToken.getTokenAddress(), parsedAmount)

    return () => {
      debouncedFetchFee.cancel()
    }
  }, [
    identity,
    parsedAmount,
    isAmountValid,
    hasAmountError,
    fromToken,
    debouncedFetchFee,
  ])

  const submit = useCallback(() => {
    if (!identity || !fromToken) return

    setIsSuccessOpen(true)
    setIsConvertSuccess(true)

    if (
      fromTokenAddress === ETH_NATIVE_ID ||
      fromTokenAddress === CKETH_CANISTER_ID
    ) {
      let convertResponse

      if (fromTokenAddress === ETH_NATIVE_ID) {
        convertResponse = ethereumService.convertToCkEth(identity, amount)
      } else {
        convertResponse = ethereumService.convertFromCkEth(
          ethAddress,
          amount,
          identity,
        )
      }

      convertResponse
        .then(() => {
          setSuccessMessage(
            `Conversion from ${amount} ${fromToken.getTokenSymbol()} successful`,
          )
          setStatus(SendStatus.COMPLETED)

          if (!initedTokens) return

          if (fromToken.getTokenAddress() === CKETH_CANISTER_ID) {
            getTokensWithUpdatedBalance(
              [fromTokenAddress, toTokenAddress],
              initedTokens,
            ).then((updatedTokens) => {
              mutateWithTimestamp("tokens", updatedTokens, false)
            })
          }
        })
        .catch((error) => {
          console.error(
            `Convert error: ${
              (error as Error).message ? (error as Error).message : error
            }`,
          )
          setErrorMessage(DEFAULT_CONVERT_ERROR)
          setStatus(SendStatus.FAILED)
          setError(error)
        })

      return
    }

    if (!btcFee) return
    let convertResponse

    if ("identityLabsFee" in btcFee) {
      convertResponse = bitcoinService.convertFromCkBtc(
        identity,
        amount,
        btcFee,
      )
    } else {
      convertResponse = bitcoinService.convertToCkBtc(identity, amount, btcFee)
    }

    convertResponse
      .then(() => {
        setSuccessMessage(
          `Conversion from ${amount} ${fromToken.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        if (!initedTokens) return

        if (fromToken.getTokenAddress() === CKBTC_CANISTER_ID) {
          getTokensWithUpdatedBalance(
            [fromTokenAddress, toTokenAddress],
            initedTokens,
          ).then((updatedTokens) => {
            mutateWithTimestamp("tokens", updatedTokens, false)
          })
        }
      })
      .catch((error) => {
        console.error(
          `Transfer error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_CONVERT_ERROR)
        setStatus(SendStatus.FAILED)
        setError(error)
      })
  }, [
    identity,
    fromToken,
    amount,
    toTokenAddress,
    fromTokenAddress,
    setErrorMessage,
    setSuccessMessage,
    initedTokens,
    btcFee,
    setIsConvertSuccess,
    ethAddress,
  ])

  return (
    <FormProvider {...formMethods}>
      <ConvertUi
        toToken={toToken}
        fromToken={fromToken}
        isTokenLoading={isTokensLoading}
        setFromChosenToken={setFromTokenAddress}
        setToChosenToken={setToTokenAddress}
        submit={submit}
        isFeeLoading={btcFee === undefined && ethFee === undefined}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        handleReverse={handleReverse}
        btcFee={btcFee}
        ethFee={ethFee}
        status={status}
        error={error}
        conversionError={conversionError}
        tokens={tokensToConvert}
      />
    </FormProvider>
  )
}
