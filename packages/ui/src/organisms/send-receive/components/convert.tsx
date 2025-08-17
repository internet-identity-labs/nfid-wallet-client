import { motion } from "framer-motion"
import { FC, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"

import { BlurredLoader } from "@nfid-frontend/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_CANISTER_ID,
  ETH_DECIMALS,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"

import { SendStatus } from "frontend/features/transfer-modal/types"
import {
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "frontend/integration/bitcoin/bitcoin.service"
import { FT } from "frontend/integration/ft/ft"

import { getBtcConversionFee } from "../utils"
import { ConvertDetails } from "./convert-details"
import { ConvertForm } from "./convert-form"
import { ConvertSuccessUi } from "./convert-success"

export enum ConvertModal {
  CONVERT = "convert",
  DETAILS = "details",
}

export interface ConvertUiProps {
  fromToken: FT | undefined
  toToken: FT | undefined
  submit: () => void
  setFromChosenToken: (value: string) => void
  setToChosenToken: (value: string) => void
  isTokenLoading: boolean
  isFeeLoading: boolean
  status: SendStatus
  error: string | undefined
  conversionError: string | undefined
  isSuccessOpen: boolean
  onClose: () => void
  handleReverse: () => void
  btcFee?: BtcToCkBtcFee | CkBtcToBtcFee
  ethFee?: bigint
  tokens: FT[]
}

export const ConvertUi: FC<ConvertUiProps> = ({
  fromToken,
  toToken,
  submit,
  setFromChosenToken,
  setToChosenToken,
  isTokenLoading,
  isFeeLoading,
  status,
  error,
  conversionError,
  isSuccessOpen,
  onClose,
  handleReverse,
  btcFee,
  ethFee,
  tokens,
}) => {
  const [convertModal, setConvertModal] = useState(ConvertModal.CONVERT)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")
  const fee =
    fromToken?.getTokenAddress() === ETH_NATIVE_ID ||
    fromToken?.getTokenAddress() === CKETH_CANISTER_ID
      ? ethFee
      : getBtcConversionFee(btcFee)

  const targetAmount = useMemo(() => {
    if (typeof fee === "bigint") {
      if (!amount || !fee) return "0.00"
      return (Number(amount) - Number(fee) / 10 ** ETH_DECIMALS).toString()
    }

    if (!amount || !fee?.total) return "0.00"
    return (Number(amount) - Number(fee?.total)).toFixed(
      toToken?.getTokenDecimals(),
    )
  }, [amount, fee])

  if (isTokenLoading || !fromToken || !toToken)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-[24px] max-h-full"
        loadingMessage="Fetching your BTC balance"
        className="text-xs"
      />
    )

  return (
    <>
      {isSuccessOpen && (
        <motion.div
          key="successModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ConvertSuccessUi
            assetImgFrom={fromToken?.getTokenLogo() ?? ""}
            assetImgTo={toToken?.getTokenLogo() ?? ""}
            titleFrom={`${amount} ${fromToken!.getTokenSymbol()}`}
            titleTo={`${targetAmount} ${toToken!.getTokenSymbol()}`}
            subTitleFrom={`${fromToken!.getTokenRateFormatted(amount || "0")}`}
            subTitleTo={`${toToken!.getTokenRateFormatted(
              targetAmount || "0",
            )}`}
            isOpen={isSuccessOpen}
            onClose={onClose}
            status={status}
            error={error}
            tokenName={toToken.getTokenName()}
            isBtc={
              toToken.getTokenAddress() === BTC_NATIVE_ID ||
              toToken.getTokenAddress() === CKBTC_CANISTER_ID
            }
          />
        </motion.div>
      )}
      {convertModal === ConvertModal.DETAILS && (
        <motion.div
          key="convertModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ConvertDetails
            token={fromToken}
            isOpen={convertModal === ConvertModal.DETAILS}
            setConvertModal={setConvertModal}
            fee={fee}
          />
        </motion.div>
      )}
      {convertModal === ConvertModal.CONVERT && (
        <motion.div
          key="formModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ConvertForm
            fromToken={fromToken}
            toToken={toToken}
            submit={submit}
            setFromChosenToken={setFromChosenToken}
            setToChosenToken={setToChosenToken}
            isFeeLoading={isFeeLoading}
            isOpen={convertModal === ConvertModal.CONVERT}
            setConvertModal={setConvertModal}
            amount={amount}
            errors={errors}
            conversionError={conversionError}
            handleReverse={handleReverse}
            fee={fee}
            targetAmount={targetAmount}
            tokens={tokens}
          />
        </motion.div>
      )}
    </>
  )
}
