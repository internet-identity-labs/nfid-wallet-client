import { motion } from "framer-motion"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"

import { BlurredLoader } from "@nfid-frontend/ui"

import {
  SelectedToken,
  SendStatus,
} from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import { BridgeSuccessUi } from "./bridge-success"
import { BridgeDetails } from "./bridge-details"
import { BridgeForm } from "./bridge-form"

export type EstimatedBridge = {
  rawFee: bigint
  sourceCost: string
  sourceUsdCost: string
  totalUsdCost: string
  amountFrom: string
  amountFromUsd: string
  amountTo: string
  amountToUsd: string
  protocolFee: {
    amount: string
    amountUSD: string
    name: string
    description: string
  }[]
}

export enum BridgeModal {
  BRIDGE = "bridge",
  DETAILS = "details",
}

export interface BridgeUiProps {
  fromToken: FT | undefined
  toToken: FT | undefined
  submit: () => void
  setFromChosenToken: (value: SelectedToken) => void
  setToChosenToken: (value: SelectedToken) => void
  isTokenLoading: boolean
  status: SendStatus
  error: string | undefined
  bridgeError: string | undefined
  isSuccessOpen: boolean
  onClose: () => void
  handleReverse: () => void
  bridgeData?: EstimatedBridge
  isBridgeDataLoading: boolean
  tokens?: FT[]
  toTokens?: FT[]
  setSkipFeeCalculation?: () => void
  onMaxResolved?: () => void
}

export const BridgeUi: FC<BridgeUiProps> = ({
  fromToken,
  toToken,
  submit,
  setFromChosenToken,
  setToChosenToken,
  isTokenLoading,
  status,
  error,
  bridgeError,
  isSuccessOpen,
  onClose,
  handleReverse,
  bridgeData,
  isBridgeDataLoading,
  tokens,
  toTokens,
  setSkipFeeCalculation,
  onMaxResolved,
}) => {
  const [bridgeModal, setBridgeModal] = useState(BridgeModal.BRIDGE)
  const [isResponsive, setIsResponsive] = useState(false)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")

  if (isTokenLoading || !fromToken || !toToken)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-[24px] max-h-full"
        loadingMessage="Fetching your EVM tokens"
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
          <BridgeSuccessUi
            assetImgFrom={fromToken?.getTokenLogo() ?? ""}
            assetImgTo={toToken?.getTokenLogo() ?? ""}
            titleFrom={`${bridgeData?.amountFrom}`}
            titleTo={`${bridgeData?.amountTo}`}
            subTitleFrom={`${bridgeData?.amountFromUsd}`}
            subTitleTo={`${bridgeData?.amountToUsd}`}
            isOpen={isSuccessOpen}
            onClose={onClose}
            status={status}
            error={error}
            tokenName={toToken.getTokenName()}
            tokenChain={toToken.getChainId()}
            isResponsive={isResponsive}
          />
        </motion.div>
      )}

      <motion.div
        key="convertModal"
        initial={{ opacity: bridgeModal === BridgeModal.DETAILS ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <BridgeDetails
          isOpen={bridgeModal === BridgeModal.DETAILS}
          setBridgeModal={setBridgeModal}
          bridgeData={bridgeData}
          amount={amount}
          fromTokenChain={fromToken.getChainId()}
          toTokenChain={toToken.getChainId()}
        />
      </motion.div>
      <motion.div
        key="formModal"
        initial={{ opacity: bridgeModal === BridgeModal.BRIDGE ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <BridgeForm
          setIsResponsive={setIsResponsive}
          isResponsive={isResponsive}
          fromToken={fromToken}
          toToken={toToken}
          submit={submit}
          setFromChosenToken={setFromChosenToken}
          setToChosenToken={setToChosenToken}
          isBridgeDataLoading={isBridgeDataLoading}
          isOpen={bridgeModal === BridgeModal.BRIDGE}
          setBridgeModal={setBridgeModal}
          amount={amount}
          errors={errors}
          bridgeError={bridgeError}
          handleReverse={handleReverse}
          bridgeData={bridgeData}
          tokens={tokens}
          toTokens={toTokens}
          setSkipFeeCalculation={setSkipFeeCalculation}
          onMaxResolved={onMaxResolved}
        />
      </motion.div>
    </>
  )
}
