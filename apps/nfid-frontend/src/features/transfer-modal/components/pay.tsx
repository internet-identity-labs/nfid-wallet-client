import BigNumber from "bignumber.js"
import { PayUi } from "packages/ui/src/organisms/send-receive/components/pay"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import {
  CKETH_LEDGER_CANISTER_ID,
  ICP_CANISTER_ID,
  POLYGON_ADDRESS,
} from "@nfid/integration/token/constants"
import { useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { FormValues, PayData, SelectedToken, SendStatus } from "../types"
import {
  getFeeSymbol,
  getTokensWithUpdatedBalance,
  mutateTokensCacheMergingBalances,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

import {
  OCPPayRequest,
  OCPTransferAmount,
  OCP_NETWORK_TO_CHAIN_ID,
  openCryptoPayService,
} from "frontend/integration/opencryptopay"
import { exchangeRateService } from "@nfid/integration"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"

interface PayProps {
  openCryptoPayParams: string
  openCryptoPayPreselect?: { method: string; asset: string }
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  onError: (value: boolean) => void
  setIsPaySuccess: (value: boolean) => void
}

export const DEFAULT_PAY_ERROR = "Something went wrong"

export const Pay = ({
  openCryptoPayParams,
  openCryptoPayPreselect,
  onClose,
  setErrorMessage,
  setSuccessMessage,
  onError,
  setIsPaySuccess,
}: PayProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [payData, setPayData] = useState<PayData | undefined>()
  const [isLoadingPayData, setIsLoadingPayData] = useState(true)
  const [paymentDetailsError, setPaymentDetailsError] = useState<
    string | undefined
  >()
  const [quoteError, setQuoteError] = useState<string | undefined>()
  const [selectedToken, setSelectedToken] = useState<
    SelectedToken | undefined
  >()
  const [payInfo, setPayInfo] = useState<
    | {
        url: string
        details: OCPPayRequest
        availableTransfers: OCPTransferAmount[]
      }
    | undefined
  >()

  const { identity } = useIdentity()
  const isSubmittingRef = useRef(false)
  const hasInitializedTokenRef = useRef(false)
  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  useEffect(() => {
    const getPayDetails = async () => {
      try {
        setPaymentDetailsError(undefined)
        const decoded = openCryptoPayService.decodeLnurl(openCryptoPayParams)
        const details = await openCryptoPayService.getPaymentDetails(decoded)
        const available = openCryptoPayService.getAvailableCurrencies(
          details.transferAmounts,
        )
        setPayInfo({ url: decoded, details, availableTransfers: available })
      } catch (e) {
        console.error("Get Payment Details error: ", e)
        setPaymentDetailsError(
          `${(e as Error).message ? (e as Error).message : e}`,
        )
      }
    }
    getPayDetails()
  }, [openCryptoPayParams])

  const setChosenToken = useCallback(
    (token: SelectedToken) => setSelectedToken(token),
    [],
  )

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const filteredTokens = useMemo(() => {
    if (!initedTokens || !payInfo) return

    const allAvailableTokens = payInfo.availableTransfers.flatMap((transfer) =>
      transfer.assets.map((asset) => ({
        method: transfer.method,
        asset: asset.asset,
        amount: asset.amount,
      })),
    )

    return initedTokens.filter((t) =>
      allAvailableTokens.some(
        (a) =>
          t.getTokenSymbol() === a.asset &&
          t.getChainId() === OCP_NETWORK_TO_CHAIN_ID[a.method],
      ),
    )
  }, [initedTokens, payInfo])

  useEffect(() => {
    if (!filteredTokens?.length) return
    if (hasInitializedTokenRef.current) return

    hasInitializedTokenRef.current = true

    if (openCryptoPayPreselect) {
      const { method, asset } = openCryptoPayPreselect
      const targetChainId =
        OCP_NETWORK_TO_CHAIN_ID[method as keyof typeof OCP_NETWORK_TO_CHAIN_ID]
      const preselected = filteredTokens.find(
        (t) =>
          t.getTokenSymbol() === asset &&
          (targetChainId === undefined || t.getChainId() === targetChainId),
      )
      if (preselected) {
        setSelectedToken({
          address: preselected.getTokenAddress(),
          chainId: preselected.getChainId(),
        })
        return
      }
    }

    const defaultToken =
      filteredTokens.find((t) => t.getTokenSymbol() === "ICP") ??
      filteredTokens.find(
        (t) => t.getTokenSymbol() === "ETH" && t.getChainId() === ChainId.ETH,
      ) ??
      filteredTokens[0]

    setSelectedToken({
      address: defaultToken.getTokenAddress(),
      chainId: defaultToken.getChainId(),
    })
  }, [filteredTokens, openCryptoPayPreselect])

  const token = useMemo(() => {
    if (!initedTokens) return
    return initedTokens.find(
      (token: FT) =>
        token.getTokenAddress() === selectedToken?.address &&
        (selectedToken?.chainId === undefined ||
          token.getChainId() === selectedToken.chainId),
    )
  }, [selectedToken, initedTokens])

  const isInsufficientBalance = useMemo(() => {
    if (!token || !payData) return false
    const balance = token.getTokenBalance()
    if (balance === undefined) return false
    const required = new BigNumber(payData.amount).multipliedBy(
      new BigNumber(10).pow(token.getTokenDecimals()),
    )
    return new BigNumber(balance.toString()).lt(required)
  }, [token, payData])

  useEffect(() => {
    if (!token || !payInfo) return

    let cancelled = false
    setPayData(undefined)
    const chain = token.getChainId()
    const transfer = payInfo.availableTransfers.find(
      (t) => OCP_NETWORK_TO_CHAIN_ID[t.method] === chain,
    )
    const transferToken = transfer?.assets.find(
      (a) => a.asset === token.getTokenSymbol(),
    )

    if (!transfer || !transferToken) return

    const amountToSend = transferToken.amount
    const symbol = transferToken.asset

    const getQuote = async () => {
      try {
        setQuoteError(undefined)

        const quote = await openCryptoPayService.getQuote(
          payInfo,
          transfer.method,
          symbol,
          Number(amountToSend),
          token.getTokenDecimals(),
        )

        let usdRate

        const { fee, targetAddress, amount, asset } = quote

        if (chain === ChainId.POL) {
          const prices = await polygonErc20Service.getUSDPrices([
            POLYGON_ADDRESS,
          ])
          const polRate = new BigNumber(prices[0].price)
          usdRate = polRate
        } else if (chain === ChainId.ICP) {
          const icpRate =
            await exchangeRateService.usdPriceForICRC1(ICP_CANISTER_ID)

          usdRate = icpRate?.value
        } else if (chain === ChainId.BTC) {
          const btcRate = await exchangeRateService.usdPriceForICRC1(
            CK_BTC_LEDGER_CANISTER_ID,
          )

          usdRate = btcRate?.value
        } else {
          const ethRate = await exchangeRateService.usdPriceForICRC1(
            CKETH_LEDGER_CANISTER_ID,
          )

          usdRate = ethRate?.value
        }

        if (!cancelled) {
          setPayData({
            feeFormatted: `${fee} ${getFeeSymbol(token.getChainId())}`,
            feeUsdFormatted: `${usdRate ? usdRate.multipliedBy(fee).toFixed(2) : "0.00"} USD`,
            amount,
            amountFormatted: `${amount} ${asset}`,
            amountUsdFormatted: `${token.getTokenRateFormatted(amount)}`,
            targetAddress,
            quote,
          })
        }
      } catch (e) {
        console.error("Get Payment Quote error: ", e)
        setQuoteError(`${(e as Error).message ? (e as Error).message : e}`)
      } finally {
        setIsLoadingPayData(false)
      }
    }
    getQuote()

    return () => {
      cancelled = true
    }
  }, [token, payInfo])

  useEffect(() => {
    onError(Boolean(quoteError))
  }, [quoteError, onError])

  const submit = useCallback(() => {
    if (!identity || !token || !payData || !payInfo) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    setIsSuccessOpen(true)
    setIsPaySuccess(true)

    openCryptoPayService
      .executePayment(payData.quote, identity)
      .then(() => {
        setSuccessMessage(
          `Supply ${payData.amount} ${token.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        if (!initedTokens) return

        const updatedTokens = getTokensWithUpdatedBalance(
          [
            {
              address: token.getTokenAddress(),
              chainId: token.getChainId(),
              amount: payData.amount,
              decimals: token.getTokenDecimals(),
            },
          ],
          initedTokens,
        )
        mutateTokensCacheMergingBalances(updatedTokens)
        mutateInitedTokens(updatedTokens, false)
      })
      .catch((error) => {
        console.error(
          `Pay error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_PAY_ERROR)
        setStatus(SendStatus.FAILED)
        setError(error)
      })
      .finally(() => {
        isSubmittingRef.current = false
      })
  }, [
    identity,
    token,
    setErrorMessage,
    setSuccessMessage,
    initedTokens,
    mutateInitedTokens,
    payData,
    setIsPaySuccess,
  ])

  return (
    <>
      <FormProvider {...formMethods}>
        <PayUi
          token={token}
          isTokenLoading={isTokensLoading}
          setChosenToken={setChosenToken}
          submit={submit}
          isSuccessOpen={isSuccessOpen}
          onClose={onClose}
          payData={payData}
          isPayDataLoading={isLoadingPayData}
          status={status}
          error={error}
          paymentDetailsError={paymentDetailsError}
          quoteError={quoteError}
          tokens={filteredTokens}
          isInsufficientBalance={isInsufficientBalance}
        />
      </FormProvider>
    </>
  )
}
