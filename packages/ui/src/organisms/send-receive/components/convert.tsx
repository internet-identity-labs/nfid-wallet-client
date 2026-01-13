import { motion } from "framer-motion"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"

import { BlurredLoader } from "@nfid/ui"
import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"

import { SendStatus } from "frontend/features/transfer-modal/types"
import {
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "frontend/integration/bitcoin/bitcoin.service"
import { FT } from "frontend/integration/ft/ft"

import { getBtcConversionFee, getEthConversionFee } from "../utils"
import { ConvertDetails } from "./convert-details"
import { ConvertForm } from "./convert-form"
import { ConvertSuccessUi } from "./convert-success"
import {
  CkEthToEthFee,
  EthToCkEthFee,
} from "frontend/integration/ethereum/evm.service"

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
  ethFee?: EthToCkEthFee | CkEthToEthFee
  tokens?: FT[]
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
  const [isResponsive, setIsResponsive] = useState(false)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")
  const fee =
    fromToken?.getTokenAddress() === ETH_NATIVE_ID ||
    fromToken?.getTokenAddress() === CKETH_LEDGER_CANISTER_ID
      ? getEthConversionFee(ethFee)
      : getBtcConversionFee(btcFee)

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
            titleTo={`${
              typeof fee === "string" ? fee : fee?.amountToReceive
            } ${toToken!.getTokenSymbol()}`}
            subTitleFrom={`${fromToken!.getTokenRateFormatted(amount || "0")}`}
            subTitleTo={
              `${toToken!.getTokenRateFormatted(
                typeof fee === "string" ? fee : fee!.amountToReceive,
              )}` || "0"
            }
            isOpen={isSuccessOpen}
            onClose={onClose}
            status={status}
            error={error}
            tokenName={toToken.getTokenName()}
            isBtc={
              toToken.getTokenAddress() === BTC_NATIVE_ID ||
              toToken.getTokenAddress() === CKBTC_CANISTER_ID
            }
            isResponsive={isResponsive}
          />
        </motion.div>
      )}

      <motion.div
        key="convertModal"
        initial={{ opacity: convertModal === ConvertModal.DETAILS ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <ConvertDetails
          token={fromToken}
          isOpen={convertModal === ConvertModal.DETAILS}
          setConvertModal={setConvertModal}
          fee={fee}
          amount={amount}
        />
      </motion.div>
      <motion.div
        key="formModal"
        initial={{ opacity: convertModal === ConvertModal.CONVERT ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <ConvertForm
          setIsResponsive={setIsResponsive}
          isResponsive={isResponsive}
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
          tokens={tokens}
          ethFee={
            fromToken.getTokenAddress() === ETH_NATIVE_ID
              ? (ethFee as EthToCkEthFee)
              : undefined
          }
        />
      </motion.div>
    </>
  )
}
