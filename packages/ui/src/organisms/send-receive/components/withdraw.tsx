import { motion } from "framer-motion"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"

import { BlurredLoader, Button, Skeleton } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import { EarnSuccessUi } from "./earn-success"
import clsx from "clsx"
import { ChooseFromToken } from "./choose-from-token"
import { IModalType } from "../utils"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { AaveFeeData } from "frontend/integration/aave"
import { WithdrawSuccessUi } from "./withdraw-success"

export interface WithdrawUiProps {
  token: FT | undefined
  balance: bigint
  submit: () => void
  isTokenLoading: boolean
  status: SendStatus
  error: string | undefined
  withdrawError: string | undefined
  isSuccessOpen: boolean
  onClose: () => void
  withdrawFeeData?: AaveFeeData
  isWithdrawDataLoading: boolean
  onMaxResolved?: () => void
}

export const WithdrawUi: FC<WithdrawUiProps> = ({
  token,
  balance,
  submit,
  isTokenLoading,
  status,
  error,
  withdrawError,
  isSuccessOpen,
  onClose,
  withdrawFeeData,
  isWithdrawDataLoading,
  onMaxResolved,
}) => {
  const [isResponsive, setIsResponsive] = useState(false)

  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")

  const isDisabled =
    isWithdrawDataLoading ||
    !amount ||
    Boolean(errors["amount"]?.message) ||
    !withdrawFeeData ||
    Boolean(withdrawError)

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
          <WithdrawSuccessUi
            assetImg={token?.getTokenLogo() ?? ""}
            title={`${amount} ${token.getTokenSymbol()}`}
            subTitle={`${token.getTokenRateFormatted(amount)}`}
            chainId={token.getChainId()}
            isOpen={isSuccessOpen}
            onClose={onClose}
            status={status}
            error={error}
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
              Withdraw
            </div>
            <p className="mb-1 text-xs select-none">Amount to withdraw</p>
            <ChooseFromToken
              modalType={IModalType.WITHDRAW}
              balance={balance}
              id={"earn-from-title"}
              token={token}
              usdRate={token.getTokenRateFormatted(amount)}
              value={amount}
              title="Amount to withdraw"
              isResponsive={isResponsive}
              setIsResponsive={setIsResponsive}
              resetKey={
                token ? `${token.getChainId()}:${token.getTokenAddress()}` : ""
              }
              withNetwork
              fee={withdrawFeeData?.rawFee.networkFee}
              onMaxResolved={onMaxResolved}
            />
            <div className="h-4 mt-1 text-xs leading-4 text-red-600">
              {errors["amount"] && (errors["amount"]?.message as string)}
            </div>
            <div
              className={clsx(
                "flex justify-between text-xs text-gray-500 dark:text-zinc-500 font-inter",
                errors["amount"] ? "mt-[15px]" : "mt-0",
              )}
            >
              <span className="leading-6">Network fee</span>
              {!amount || errors["amount"] ? null : withdrawFeeData ===
                undefined ? (
                <div className="text-right">
                  <Skeleton className="w-[70px] h-3 rounded-lg ml-auto" />
                  <Skeleton className="w-[50px] h-3 rounded-lg mt-1.5 ml-auto" />
                </div>
              ) : (
                <div className="text-right">
                  <div>{withdrawFeeData.feeFormatted.fee}</div>
                  <div>{withdrawFeeData.feeFormatted.feeUsd}</div>
                </div>
              )}
            </div>
            {withdrawError && (
              <div className="mt-2 text-xs text-red-600">{withdrawError}</div>
            )}
            <Button
              className="absolute bottom-5 left-5 right-5 !w-auto"
              type="primary"
              id="swapTokensButton"
              block
              icon={
                !amount || errors["amount"] ? null : withdrawFeeData ===
                    undefined && !withdrawError ? (
                  <Spinner className="w-5 h-5 text-white" />
                ) : null
              }
              disabled={isDisabled}
              onClick={submit}
            >
              {!amount
                ? "Enter an amount"
                : withdrawFeeData === undefined &&
                    !withdrawError &&
                    !errors["amount"]
                  ? "Calculating fee"
                  : "Withdraw"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
