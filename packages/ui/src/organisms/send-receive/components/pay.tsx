import { motion } from "framer-motion"
import { FC, useState } from "react"

import {
  BlurredLoader,
  Button,
  IconCmpArrow,
  Input,
  Skeleton,
} from "@nfid-frontend/ui"

import {
  PayData,
  SelectedToken,
  SendStatus,
} from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { ChooseToToken } from "./choose-to-token"
import { PaySuccessUi } from "./pay-success"
import { DEFAULT_PAY_ERROR } from "frontend/features/transfer-modal/components/pay"

import PaymentDetailsErrorImg from "../assets/payment-details-error.png"
import PaymentDetailsErrorDarkImg from "../assets/payment-details-error-dark.png"
import { useDarkTheme } from "frontend/hooks"

export interface PayUiProps {
  token: FT | undefined
  submit: () => void
  setChosenToken: (value: SelectedToken) => void
  isTokenLoading: boolean
  status: SendStatus
  error: string | undefined
  paymentDetailsError: string | undefined
  quoteError: string | undefined
  isSuccessOpen: boolean
  onClose: () => void
  payData?: PayData
  isPayDataLoading: boolean
  tokens?: FT[]
  isInsufficientBalance?: boolean
  onTryAgain?: () => void
}

export const PayUi: FC<PayUiProps> = ({
  token,
  submit,
  setChosenToken,
  isTokenLoading,
  status,
  error,
  paymentDetailsError,
  quoteError,
  isSuccessOpen,
  onClose,
  payData,
  isPayDataLoading,
  tokens,
  isInsufficientBalance,
  onTryAgain,
}) => {
  const [isResponsive, setIsResponsive] = useState(false)
  const isDarkTheme = useDarkTheme()

  const isDisabled =
    isPayDataLoading ||
    !payData ||
    Boolean(quoteError) ||
    Boolean(isInsufficientBalance)

  if (paymentDetailsError)
    return (
      <div className="absolute top-0 bottom-0 left-0 right-0 p-5">
        <div className="leading-10 text-[20px] font-bold">
          {DEFAULT_PAY_ERROR}
        </div>
        <img
          src={
            isDarkTheme ? PaymentDetailsErrorDarkImg : PaymentDetailsErrorImg
          }
          alt="Payment error"
          className="block my-5 mx-auto max-h-[200px]"
        />
        <div className="mb-5 dark:text-white">
          Please ensure you are scanning a valid Open CryptoPay QR code and try
          again.
        </div>
        <div className="flex gap-2.5">
          <Button type="stroke" className="w-full" onClick={onClose}>
            Close
          </Button>
          <Button className="w-full" onClick={onTryAgain}>
            Try again
          </Button>
        </div>
      </div>
    )

  if (isTokenLoading || !token || isPayDataLoading)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-[24px] max-h-full"
        loadingMessage="Fetching your payment details"
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
          <PaySuccessUi
            assetImg={token?.getTokenLogo() ?? ""}
            title={payData!.amountFormatted}
            subTitle={payData!.amountUsdFormatted}
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
              Pay
            </div>
            <p className="mb-1 text-xs select-none dark:text-zinc-500">
              Amount to send
            </p>
            <ChooseToToken
              setToChosenToken={setChosenToken}
              isLoading={isPayDataLoading || !payData}
              token={token}
              usdRate={payData?.amountUsdFormatted}
              value={payData?.amount}
              tokens={tokens}
              title="Amount to supply"
              isResponsive={isResponsive}
              setIsResponsive={setIsResponsive}
              withNetwork
              isTokenModalHighlighted
            />
            <div className="h-4 mt-1 text-xs leading-4 text-red-600">
              {isInsufficientBalance && "Insufficient funds"}
            </div>
            <Input
              type="text"
              disabled
              value={payData?.targetAddress}
              labelText="To"
              placeholder="{recipient wallet address or account ID}"
              inputClassName="!border-0 h-[56px] text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 !bg-gray-50 dark:!bg-zinc-700"
              labelClassName="!text-black dark:!text-zinc-500"
              className="mb-[10px]"
            />
            <div
              className={clsx(
                "flex justify-between text-xs text-gray-500 dark:text-zinc-500 font-inter",
              )}
            >
              <span className="leading-6">Network fee</span>
              {quoteError ? null : payData === undefined ? (
                <div className="text-right">
                  <Skeleton className="w-[70px] h-3 rounded-lg ml-auto" />
                  <Skeleton className="w-[50px] h-3 rounded-lg mt-1.5 ml-auto" />
                </div>
              ) : (
                <div className="text-right">
                  <div>{payData.feeFormatted}</div>
                  <div>{payData.feeUsdFormatted}</div>
                </div>
              )}
            </div>
            {quoteError && (
              <div className="mt-2 text-xs text-red-600">
                {DEFAULT_PAY_ERROR}
              </div>
            )}
            <Button
              className="absolute bottom-5 left-5 right-5 !w-auto"
              type="primary"
              id="swapTokensButton"
              block
              icon={
                quoteError ? null : payData === undefined && !quoteError ? (
                  <Spinner className="w-5 h-5 text-white" />
                ) : (
                  <IconCmpArrow
                    className={clsx(
                      "!w-[18px] !h-[18px] rotate-[135deg] !max-w-5 !max-h-5",
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
              Send
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
