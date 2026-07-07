import BigNumber from "bignumber.js"
import debounce from "lodash/debounce"
import { ConvertUi } from "packages/ui/src/organisms/send-receive/components/convert"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  CKSEPOLIA_LEDGER_CANISTER_ID,
  ETH_DECIMALS,
  ETH_NATIVE_ID,
  EVM_NATIVE,
  TRIM_ZEROS,
} from "@nfid/integration/token/constants"
import {
  isCkErc20Token,
  getCkErc20ByErc20Address,
  getCkErc20ByLedgerId,
} from "@nfid/integration/token/ckerc20.config"
import { mutateWithTimestamp, useSWRWithTimestamp } from "@nfid/swr"

import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useEthAddress } from "frontend/hooks"
import { useIdentity } from "frontend/hooks/identity"
import {
  bitcoinService,
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "frontend/integration/bitcoin/bitcoin.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { ethSepoliaService } from "frontend/integration/ethereum/eth/testnetwork/eth-sepolia.service"
import {
  CkEthToEthFee,
  CkErc20ToErc20Fee,
  Erc20ToCkErc20Fee,
  EthToCkEthFee,
} from "frontend/integration/ethereum/evm.service"

import { FT } from "frontend/integration/ft/ft"

import { FormValues, SendStatus } from "../types"
import {
  getConversionTokenAddress,
  getTokensWithUpdatedBalance,
  mutateTokensCacheMergingBalances,
  updateCachedInitedTokens,
  isInsufficientEthForGas,
  INSUFFICIENT_ETH_FOR_GAS_ERROR,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { useUserPrefs } from "frontend/hooks/user-prefs"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { authState } from "@nfid/integration"
import { Principal } from "@icp-sdk/core/principal"

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
  const [initingToToken, setInitingToToken] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [btcFee, setBtcFee] = useState<BtcToCkBtcFee | CkBtcToBtcFee>()
  const [ethFee, setEthFee] = useState<CkEthToEthFee | EthToCkEthFee>()
  const [erc20Fee, setErc20Fee] = useState<
    Erc20ToCkErc20Fee | CkErc20ToErc20Fee
  >()
  const [conversionError, setConversionError] = useState<string | undefined>()

  const [fromTokenAddress, setFromTokenAddress] = useState(
    preselectedSourceTokenAddress || BTC_NATIVE_ID,
  )
  const { identity } = useIdentity()
  const { testnetEnabled } = useUserPrefs()
  const [toTokenAddress, setToTokenAddress] = useState(
    getConversionTokenAddress(preselectedSourceTokenAddress ?? BTC_NATIVE_ID),
  )
  const { ethAddress } = useEthAddress()
  const isMaxAmountRef = useRef(false)

  const onMaxResolved = useCallback(() => {
    isMaxAmountRef.current = true
  }, [])

  const handleReverse = useCallback(() => {
    setFromTokenAddress(toTokenAddress)
    setToTokenAddress(fromTokenAddress)
  }, [fromTokenAddress, toTokenAddress])

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const filteredTokens = useMemo(() => {
    if (!initedTokens) return
    return initedTokens.filter((t, _, arr) => {
      const addr = t.getTokenAddress()
      const ckErc20ByErc20 = getCkErc20ByErc20Address(addr)
      return (
        addr === ETH_NATIVE_ID ||
        addr === BTC_NATIVE_ID ||
        addr === CKETH_LEDGER_CANISTER_ID ||
        addr === CKBTC_CANISTER_ID ||
        isCkErc20Token(addr) ||
        (!!ckErc20ByErc20 &&
          arr.some(
            (tok) => tok.getTokenAddress() === ckErc20ByErc20.ledgerCanisterId,
          )) ||
        (addr === CKSEPOLIA_LEDGER_CANISTER_ID &&
          testnetEnabled &&
          arr.find(
            (t) =>
              t.getTokenAddress() === EVM_NATIVE &&
              t.getChainId() === ChainId.ETH_SEPOLIA,
          )) ||
        (addr === EVM_NATIVE &&
          t.getChainId() === ChainId.ETH_SEPOLIA &&
          testnetEnabled &&
          arr.find((t) => t.getTokenAddress() === CKSEPOLIA_LEDGER_CANISTER_ID))
      )
    })
  }, [initedTokens, testnetEnabled])

  useEffect(() => {
    setToTokenAddress(getConversionTokenAddress(fromTokenAddress))
  }, [fromTokenAddress])

  const fromToken = useMemo(() => {
    if (!filteredTokens) return
    return filteredTokens.find(
      (token: FT) =>
        token.getTokenAddress().toLowerCase() ===
        fromTokenAddress.toLowerCase(),
    )
  }, [fromTokenAddress, filteredTokens])

  const toToken = useMemo(() => {
    if (!filteredTokens) return
    return filteredTokens.find(
      (token: FT) =>
        token.getTokenAddress().toLowerCase() === toTokenAddress.toLowerCase(),
    )
  }, [toTokenAddress, filteredTokens])

  useEffect(() => {
    if (!!toToken || !initedTokens) return

    const initToToken = async () => {
      setInitingToToken(true)
      const uninitedToken = tokens.find(
        (t) =>
          t.getTokenAddress().toLowerCase() === toTokenAddress.toLowerCase(),
      )
      if (!uninitedToken) return

      const { publicKey } = authState.getUserIdData()
      const principal = Principal.fromText(publicKey)

      const initedToken = await uninitedToken.init(principal)
      mutateInitedTokens([...initedTokens, initedToken], false)
      setInitingToToken(false)
    }

    initToToken()
  }, [toTokenAddress, toToken, initedTokens])

  useEffect(() => {
    setConversionError(undefined)
  }, [fromToken, toToken])

  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  useEffect(() => {
    onError(Boolean(conversionError))
  }, [conversionError, onError])

  const { watch, setValue } = formMethods
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
        } else if (
          tokenAddress === ETH_NATIVE_ID ||
          tokenAddress === CKETH_LEDGER_CANISTER_ID ||
          tokenAddress === EVM_NATIVE ||
          tokenAddress === CKSEPOLIA_LEDGER_CANISTER_ID
        ) {
          const isMaxAmount = isMaxAmountRef.current
          isMaxAmountRef.current = false
          setEthFee(undefined)
          setConversionError(undefined)
          try {
            const value = new BigNumber(amount)
              .toFixed(ETH_DECIMALS)
              .replace(TRIM_ZEROS, "")

            const service =
              tokenAddress === EVM_NATIVE ||
              tokenAddress === CKSEPOLIA_LEDGER_CANISTER_ID
                ? ethSepoliaService
                : ethereumService

            const fee =
              tokenAddress === ETH_NATIVE_ID || tokenAddress === EVM_NATIVE
                ? await service.getEthToCkEthFee(identity, value)
                : await service.getCkEthToEthFee(ethAddress, value)

            setEthFee(fee)

            if (
              isMaxAmount &&
              (tokenAddress === ETH_NATIVE_ID || tokenAddress === EVM_NATIVE) &&
              fromToken
            ) {
              const balance = fromToken.getTokenBalance()
              const networkFee = (fee as EthToCkEthFee).ethereumNetworkFee
              if (balance !== undefined && networkFee !== undefined) {
                const adjustedRaw = balance - networkFee
                if (adjustedRaw > BigInt(0)) {
                  const decimals = fromToken.getTokenDecimals()
                  const formattedValue = new BigNumber(adjustedRaw.toString())
                    .dividedBy(new BigNumber(10).pow(decimals))
                    .toFixed(decimals)
                    .replace(TRIM_ZEROS, "")
                  setValue("amount", formattedValue, { shouldValidate: true })
                }
              }
            }
          } catch (e) {
            console.error(`ETH error: ${e}`)
            setConversionError((e as Error).message)
            setEthFee(undefined)
          }
        } else {
          const ckErc20Token =
            getCkErc20ByLedgerId(tokenAddress) ??
            getCkErc20ByErc20Address(tokenAddress)
          if (!ckErc20Token) return

          setErc20Fee(undefined)
          setConversionError(undefined)
          try {
            const isToCkErc20 = !!getCkErc20ByErc20Address(tokenAddress)
            const fee = isToCkErc20
              ? await ethereumService.getErc20ToCkErc20Fee(
                  identity,
                  ckErc20Token.ledgerCanisterId,
                  amount,
                )
              : await ethereumService.getCkErc20ToErc20Fee(
                  ckErc20Token.ledgerCanisterId,
                  amount,
                )
            setErc20Fee(fee)
          } catch (e) {
            console.error(`ERC20 convert error: ${e}`)
            setConversionError((e as Error).message)
            setErc20Fee(undefined)
          }
        }
      }, 1000),
    [ethAddress, fromToken, setValue],
  )

  useEffect(() => {
    if (!identity || !isAmountValid || !fromToken || hasAmountError) return

    debouncedFetchFee(identity, fromToken.getTokenAddress(), amount)

    return () => {
      debouncedFetchFee.cancel()
    }
  }, [
    identity,
    amount,
    isAmountValid,
    hasAmountError,
    fromToken,
    debouncedFetchFee,
  ])

  const submit = useCallback(() => {
    if (!identity || !fromToken) return

    setIsSuccessOpen(true)
    setIsConvertSuccess(true)

    const isEthConvert =
      fromTokenAddress === ETH_NATIVE_ID ||
      fromTokenAddress === CKETH_LEDGER_CANISTER_ID
    const isSepoliaConvert =
      fromTokenAddress === EVM_NATIVE ||
      fromTokenAddress === CKSEPOLIA_LEDGER_CANISTER_ID

    if (isEthConvert || isSepoliaConvert) {
      const service = isSepoliaConvert ? ethSepoliaService : ethereumService
      const isToCkEth =
        fromTokenAddress === ETH_NATIVE_ID || fromTokenAddress === EVM_NATIVE

      const convertResponse = isToCkEth
        ? service.convertToCkEth(identity, amount, ethFee as EthToCkEthFee)
        : service.convertFromCkEth(ethAddress, amount, identity)

      convertResponse
        .then(() => {
          setSuccessMessage(
            `Conversion from ${amount} ${fromToken.getTokenSymbol()} successful`,
          )
          setStatus(SendStatus.COMPLETED)

          if (!initedTokens) return

          const isCkEthToNative =
            fromToken.getTokenAddress() === CKETH_LEDGER_CANISTER_ID ||
            fromToken.getTokenAddress() === CKSEPOLIA_LEDGER_CANISTER_ID
          const fee = isCkEthToNative
            ? ethFee!.icpNetworkFee
            : (ethFee as EthToCkEthFee).ethereumNetworkFee

          const updatedTokens = getTokensWithUpdatedBalance(
            [
              {
                address: fromTokenAddress,
                amount,
                decimals: fromToken.getTokenDecimals(),
                fee,
              },
            ],
            initedTokens,
          )
          mutateWithTimestamp("tokens", updatedTokens, false)
          updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
        })
        .catch((error) => {
          console.error(
            `Convert error: ${
              (error as Error).message ? (error as Error).message : error
            }`,
          )
          const errorMessage = isInsufficientEthForGas(error)
            ? INSUFFICIENT_ETH_FOR_GAS_ERROR
            : DEFAULT_CONVERT_ERROR
          setErrorMessage(errorMessage)
          setStatus(SendStatus.FAILED)
          setError(errorMessage)
        })

      return
    }

    const ckErc20Token =
      getCkErc20ByLedgerId(fromTokenAddress) ??
      getCkErc20ByErc20Address(fromTokenAddress)

    if (ckErc20Token) {
      const isToCkErc20 = !!getCkErc20ByErc20Address(fromTokenAddress)

      const convertResponse = isToCkErc20
        ? ethereumService.convertToCkErc20(
            identity,
            ckErc20Token.ledgerCanisterId,
            amount,
            erc20Fee as Erc20ToCkErc20Fee,
          )
        : ethereumService.convertFromCkErc20(
            identity,
            ckErc20Token.ledgerCanisterId,
            ethAddress,
            amount,
          )

      convertResponse
        .then(() => {
          setSuccessMessage(
            `Conversion from ${amount} ${fromToken.getTokenSymbol()} successful`,
          )
          setStatus(SendStatus.COMPLETED)

          if (!initedTokens) return

          const updatedTokens = getTokensWithUpdatedBalance(
            [
              {
                address: fromTokenAddress,
                amount,
                decimals: fromToken.getTokenDecimals(),
                fee: BigInt(0),
              },
            ],
            initedTokens,
          )
          mutateWithTimestamp("tokens", updatedTokens, false)
          updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
        })
        .catch((error) => {
          console.dir(error)
          console.error(
            `ERC20 convert error: ${
              (error as Error).message ? (error as Error).message : error
            }`,
          )
          const errorMessage = isInsufficientEthForGas(error)
            ? INSUFFICIENT_ETH_FOR_GAS_ERROR
            : DEFAULT_CONVERT_ERROR
          setErrorMessage(errorMessage)
          setStatus(SendStatus.FAILED)
          setError(errorMessage)
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

        const isCkBtcToNative =
          fromToken.getTokenAddress() === CKBTC_CANISTER_ID
        const fee = isCkBtcToNative
          ? btcFee.icpNetworkFee
          : (btcFee as BtcToCkBtcFee).bitcointNetworkFee.fee_satoshis

        const updatedTokens = getTokensWithUpdatedBalance(
          [
            {
              address: fromTokenAddress,
              amount,
              decimals: fromToken.getTokenDecimals(),
              fee,
            },
          ],
          initedTokens,
        )
        mutateWithTimestamp("tokens", updatedTokens, false)
        updateCachedInitedTokens(updatedTokens, mutateInitedTokens)
      })
      .catch((error) => {
        console.error(
          `Transfer error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_CONVERT_ERROR)
        setStatus(SendStatus.FAILED)
        setError(DEFAULT_CONVERT_ERROR)
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
    ethFee,
    erc20Fee,
    setIsConvertSuccess,
    ethAddress,
    mutateInitedTokens,
  ])

  const isBtcConvert =
    fromTokenAddress === BTC_NATIVE_ID || fromTokenAddress === CKBTC_CANISTER_ID
  const isEthConvertActive =
    fromTokenAddress === ETH_NATIVE_ID ||
    fromTokenAddress === CKETH_LEDGER_CANISTER_ID ||
    fromTokenAddress === EVM_NATIVE ||
    fromTokenAddress === CKSEPOLIA_LEDGER_CANISTER_ID
  const isErc20Convert =
    isCkErc20Token(fromTokenAddress) ||
    !!getCkErc20ByErc20Address(fromTokenAddress)

  const isFeeLoading = isBtcConvert
    ? btcFee === undefined
    : isEthConvertActive
      ? ethFee === undefined
      : isErc20Convert
        ? erc20Fee === undefined
        : false

  return (
    <FormProvider {...formMethods}>
      <ConvertUi
        toToken={toToken}
        fromToken={fromToken}
        isTokenLoading={isTokensLoading || initingToToken}
        setFromChosenToken={setFromTokenAddress}
        setToChosenToken={setToTokenAddress}
        submit={submit}
        isFeeLoading={isFeeLoading}
        isSuccessOpen={isSuccessOpen}
        onClose={onClose}
        handleReverse={handleReverse}
        btcFee={btcFee}
        ethFee={ethFee}
        erc20Fee={erc20Fee}
        status={status}
        error={error}
        conversionError={conversionError}
        tokens={filteredTokens}
        onMaxResolved={onMaxResolved}
      />
    </FormProvider>
  )
}
