import { SignIdentity } from "@dfinity/agent"
import debounce from "lodash/debounce"
import { ConvertUi } from "packages/ui/src/organisms/send-receive/components/convert"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import {
  bitcoinService,
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "frontend/integration/bitcoin/bitcoin.service"
import { FT } from "frontend/integration/ft/ft"

import { FormValues, SendStatus } from "../types"
import {
  getConversionTokenAddress,
  getIdentity,
  getTokensWithUpdatedBalance,
} from "../utils"

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
  const [identity, setIdentity] = useState<SignIdentity>()
  const [btcFee, setBtcFee] = useState<BtcToCkBtcFee | CkBtcToBtcFee>()
  const [btcError, setBtcError] = useState<string | undefined>()
  const [fromTokenAddress, setFromTokenAddress] = useState(
    preselectedSourceTokenAddress || BTC_NATIVE_ID,
  )

  const [toTokenAddress, setToTokenAddress] = useState(
    getConversionTokenAddress(preselectedSourceTokenAddress ?? BTC_NATIVE_ID),
  )

  const handleReverse = useCallback(() => {
    setFromTokenAddress(toTokenAddress)
    setToTokenAddress(fromTokenAddress)
  }, [fromTokenAddress, toTokenAddress])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const fromToken = useMemo(() => {
    return tokens.find(
      (token: FT) => token.getTokenAddress() === fromTokenAddress,
    )
  }, [fromTokenAddress, tokens])

  const toToken = useMemo(() => {
    return tokens.find(
      (token: FT) => token.getTokenAddress() === toTokenAddress,
    )
  }, [toTokenAddress, tokens])

  useEffect(() => {
    setBtcError(undefined)
  }, [fromTokenAddress, toTokenAddress])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  useEffect(() => {
    onError(Boolean(btcError))
  }, [btcError, onError])

  useEffect(() => {
    const getSignIdentity = async () => {
      const identity = await getIdentity([
        PATRON_CANISTER_ID,
        CHAIN_FUSION_SIGNER_CANISTER_ID,
        CK_BTC_MINTER_CANISTER_ID,
        CK_BTC_LEDGER_CANISTER_ID,
      ])
      setIdentity(identity)
    }

    getSignIdentity()
  }, [])

  const { watch } = formMethods
  const amount = watch("amount")

  const parsedAmount = Number(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  const hasAmountError = !!formMethods.formState.errors.amount

  const debouncedFetchFee = useMemo(
    () =>
      debounce(async (identity, tokenAddress, amount) => {
        setBtcFee(undefined)

        try {
          const fee =
            tokenAddress === BTC_NATIVE_ID
              ? await bitcoinService.getBtcToCkBtcFee(identity, amount)
              : await bitcoinService.getCkBtcToBtcFee(identity, amount)

          setBtcFee(fee)
        } catch (e) {
          console.error(`BTC error: ${e}`)
          setBtcError((e as Error).message)
          setBtcFee(undefined)
        }
      }, 500),
    [],
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
    if (!identity || !fromToken || !btcFee) return

    setIsSuccessOpen(true)
    setIsConvertSuccess(true)
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

        if (fromToken.getTokenAddress() === CKBTC_CANISTER_ID) {
          getTokensWithUpdatedBalance(
            [fromTokenAddress, toTokenAddress],
            tokens,
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
    tokens,
    btcFee,
    setIsConvertSuccess,
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
        isFeeLoading={btcFee === undefined}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        handleReverse={handleReverse}
        btcFee={btcFee}
        status={status}
        error={error}
        btcError={btcError}
      />
    </FormProvider>
  )
}
