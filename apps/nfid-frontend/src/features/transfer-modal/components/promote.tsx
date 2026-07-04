import BigNumber from "bignumber.js"
import { PromoteUi } from "packages/ui/src/organisms/send-receive/components/promote"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { FormProvider, useForm } from "react-hook-form"
import { mutate, useSWR, useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "frontend/features/fungible-token/utils"
import { useIdentity } from "frontend/hooks/identity"
import { FT } from "frontend/integration/ft/ft"
import { FormValues, SendStatus } from "../types"
import {
  getTokensWithUpdatedBalance,
  mutateTokensCacheMergingBalances,
} from "../utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import {
  NFIDW_CANISTER_ID,
  NFIDW_PROMOTE_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { PromoteData, promotionService } from "@nfid/integration/promotion"

interface PayProps {
  onClose: () => void
  setErrorMessage: (message: string) => void
  setSuccessMessage: (message: string) => void
  setIsPromoteSuccess: (value: boolean) => void
  dappId: number
}

export const DEFAULT_PROMOTE_ERROR = "Something went wrong"

export const Promote = ({
  onClose,
  setErrorMessage,
  setSuccessMessage,
  setIsPromoteSuccess,
  dappId,
}: PayProps) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [status, setStatus] = useState(SendStatus.PENDING)
  const [error, setError] = useState<string | undefined>()
  const [promoteData, setPromoteData] = useState<PromoteData>()
  const [isPromoteDataLoading, setIsPromoteDataLoading] = useState(false)

  const { identity } = useIdentity()
  const isSubmittingRef = useRef(false)
  const formMethods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      amount: "",
    },
  })

  const { watch } = formMethods
  const amount = watch("amount")

  const { data: discoveryApps } = useSWR(
    "discoveryApps",
    async () => icrc1OracleService.getDiscoveryApps(),
    { revalidateOnFocus: false },
  )

  const { data: promotionStatus, isLoading: isPromotionStatusLoading } = useSWR(
    "promotionStatus",
    async () => promotionService.getStatus(),
    {
      revalidateOnFocus: false,
    },
  )

  const { data: tokens = [], isLoading: isTokensLoading } = useSWRWithTimestamp(
    "tokens",
    fetchTokens,
    { revalidateOnFocus: false, revalidateOnMount: false },
  )

  const { initedTokens, mutate: mutateInitedTokens } = useTokensInit(tokens)

  const token = useMemo(() => {
    if (!initedTokens) return

    return initedTokens.find(
      (token: FT) =>
        token.getTokenAddress() === NFIDW_CANISTER_ID &&
        token.getChainId() === ChainId.ICP,
    )
  }, [initedTokens])

  useEffect(() => {
    if (!discoveryApps || !token || !promotionStatus) return

    const getPromoteData = async () => {
      setIsPromoteDataLoading(true)
      const dapp = discoveryApps.find((app) => app.id === dappId)

      if (!dapp) return
      const decimals = token.getTokenDecimals()
      const rawFee = await token.getTokenFee()
      const fee = new BigNumber(rawFee.getFee()).dividedBy(
        new BigNumber(10).pow(decimals),
      )
      const feeUsd = token.getTokenRate(fee.toString())
      const minAmount = new BigNumber(promotionStatus.minNextBidE8s)
        .dividedBy(new BigNumber(10).pow(decimals))
        .toNumber()

      setPromoteData({
        feeFormatted: `${fee.toString()} ${token.getTokenSymbol()}`,
        feeUsdFormatted: `${feeUsd?.toFixed(2) || "0.00"} USD`,
        targetAddress: NFIDW_PROMOTE_CANISTER_ID,
        dappName: dapp.name || "",
        fee: rawFee.getFee(),
        minAmount,
      })
      setIsPromoteDataLoading(false)
    }

    getPromoteData()
  }, [token, discoveryApps, promotionStatus])

  const submit = useCallback(() => {
    if (!identity || !token) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    setIsSuccessOpen(true)
    setIsPromoteSuccess(true)

    promotionService
      .placeBid(
        identity,
        dappId,
        BigInt(Number(amount) * 10 ** token.getTokenDecimals()),
      )
      .then(() => {
        setSuccessMessage(
          `Promotion ${amount} ${token.getTokenSymbol()} successful`,
        )
        setStatus(SendStatus.COMPLETED)
        if (!initedTokens) return

        mutate("promotionStatus")
        const updatedTokens = getTokensWithUpdatedBalance(
          [
            {
              address: token.getTokenAddress(),
              chainId: token.getChainId(),
              amount: amount,
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
          `Promotion error: ${
            (error as Error).message ? (error as Error).message : error
          }`,
        )
        setErrorMessage(DEFAULT_PROMOTE_ERROR)
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
    setIsPromoteSuccess,
    amount,
  ])

  return (
    <>
      <FormProvider {...formMethods}>
        <PromoteUi
          token={token}
          isTokenLoading={isTokensLoading}
          promoteData={promoteData}
          isPromoteDataLoading={
            isPromoteDataLoading || isPromotionStatusLoading
          }
          submit={submit}
          isSuccessOpen={isSuccessOpen}
          onClose={onClose}
          status={status}
          error={error}
        />
      </FormProvider>
    </>
  )
}
