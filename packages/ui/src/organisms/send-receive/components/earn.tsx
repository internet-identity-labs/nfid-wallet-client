import { motion } from "framer-motion"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"

import { BlurredLoader, Button, IconCmpEarn, Skeleton } from "@nfid-frontend/ui"

import {
  SelectedToken,
  SendStatus,
} from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import { EarnSuccessUi } from "./earn-success"
import clsx from "clsx"
import { ChooseFromToken } from "./choose-from-token"
import { IModalType } from "../utils"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { AaveFeeData } from "frontend/integration/aave"

export interface EarnUiProps {
  token: FT | undefined
  submit: () => void
  setChosenToken: (value: SelectedToken) => void
  isTokenLoading: boolean
  status: SendStatus
  error: string | undefined
  earnError: string | undefined
  isSuccessOpen: boolean
  onClose: () => void
  earnFeeData?: AaveFeeData
  apy?: string
  isEarnDataLoading: boolean
  tokens?: FT[]
  setSkipFeeCalculation?: () => void
  onMaxResolved?: () => void
  isUpdate?: boolean
}

export const EarnUi: FC<EarnUiProps> = ({
  token,
  submit,
  setChosenToken,
  isTokenLoading,
  status,
  error,
  earnError,
  isSuccessOpen,
  onClose,
  earnFeeData,
  apy,
  isEarnDataLoading,
  tokens,
  setSkipFeeCalculation,
  onMaxResolved,
  isUpdate,
}) => {
  const [isResponsive, setIsResponsive] = useState(false)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")

  const isDisabled =
    isEarnDataLoading ||
    !amount ||
    Boolean(errors["amount"]?.message) ||
    !earnFeeData ||
    Boolean(earnError)

  if (isTokenLoading || !token)
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
          <EarnSuccessUi
            assetImg={token?.getTokenLogo() ?? ""}
            title={`${amount} ${token?.getTokenSymbol()}`}
            subTitle={`${token.getTokenRateFormatted(amount)}`}
            isOpen={isSuccessOpen}
            onClose={onClose}
            status={status}
            error={error}
            chainId={token.getChainId()}
          />
        </motion.div>
      )}
      <motion.div
        key="formModal"
        initial={{ opacity: !isSuccessOpen ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className={clsx(isResponsive && "pb-[70px]")}>
          <div>
            <div className="leading-10 text-[20px] font-bold mb-[18px]">
              Supply
            </div>
            <p className="mb-1 text-xs select-none">Amount to supply</p>
            <ChooseFromToken
              modalType={IModalType.EARN}
              id={"earn-from-title"}
              token={token}
              setFromChosenToken={isUpdate ? undefined : setChosenToken}
              usdRate={token.getTokenRateFormatted(amount)}
              value={amount}
              tokens={tokens}
              title="Amount to supply"
              isResponsive={isResponsive}
              setIsResponsive={setIsResponsive}
              resetKey={
                token ? `${token.getChainId()}:${token.getTokenAddress()}` : ""
              }
              withNetwork
              fee={earnFeeData?.rawFee.networkFee}
              setSkipFeeCalculation={setSkipFeeCalculation}
              onMaxResolved={onMaxResolved}
            />
            <div className="h-4 mt-1 text-xs leading-4 text-red-600">
              {errors["amount"] && (errors["amount"]?.message as string)}
            </div>
            <div
              className={clsx(
                "flex justify-between items-center text-xs text-gray-500 dark:text-zinc-500 font-inter",
                errors["amount"] ? "mt-[15px]" : "mt-1",
              )}
            >
              <span className="leading-6">Supply APY</span>
              {!amount || errors["amount"] ? null : earnFeeData ===
                undefined ? (
                <Skeleton className="w-[70px] h-3 rounded-lg ml-auto" />
              ) : (
                <span className="leading-5">{apy}</span>
              )}
            </div>
            <div
              className={clsx(
                "flex justify-between text-xs text-gray-500 dark:text-zinc-500 font-inter",
              )}
            >
              <span className="leading-6">Network fee</span>
              {!amount || errors["amount"] ? null : earnFeeData ===
                undefined ? (
                <div className="text-right">
                  <Skeleton className="w-[70px] h-3 rounded-lg ml-auto" />
                  <Skeleton className="w-[50px] h-3 rounded-lg mt-1.5 ml-auto" />
                </div>
              ) : (
                <div className="text-right">
                  <div>{earnFeeData.feeFormatted.fee}</div>
                  <div>{earnFeeData.feeFormatted.feeUsd}</div>
                </div>
              )}
            </div>
            {earnError && (
              <div className="mt-2 text-xs text-red-600">{earnError}</div>
            )}
            <Button
              className="absolute bottom-5 left-5 right-5 !w-auto"
              type="primary"
              id="swapTokensButton"
              block
              icon={
                !amount || errors["amount"] ? null : earnFeeData ===
                    undefined && !earnError ? (
                  <Spinner className="w-5 h-5 text-white" />
                ) : (
                  <IconCmpEarn
                    className={clsx(
                      "!w-[18px] !h-[18px]",
                      isDisabled
                        ? "text-cecondary dark:text-zinc-500"
                        : "text-white",
                    )}
                  />
                )
              }
              disabled={isDisabled}
              onClick={submit}
            >
              {!amount
                ? "Enter an amount"
                : earnFeeData === undefined && !earnError && !errors["amount"]
                  ? "Calculating fee"
                  : "Supply"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
