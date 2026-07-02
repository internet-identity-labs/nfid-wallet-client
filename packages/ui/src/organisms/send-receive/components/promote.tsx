import { motion } from "framer-motion"
import { FC, useState } from "react"

import { BlurredLoader, Button, Input, Skeleton } from "@nfid-frontend/ui"

import { SendStatus } from "frontend/features/transfer-modal/types"
import { FT } from "frontend/integration/ft/ft"

import clsx from "clsx"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { PromoteSuccessUi } from "./promote-success"

import { ChooseFromToken } from "./choose-from-token"
import { IModalType } from "../utils"
import { useFormContext } from "react-hook-form"
import { InfoIcon } from "packages/ui/src/atoms/icons/info"
import { ReactComponent as ArrowLeft } from "../../../atoms/icons/arrow.svg"
import { PromoteData } from "@nfid/integration/promotion"

export interface PromoteUiProps {
  token: FT | undefined
  submit: () => void
  isTokenLoading: boolean
  status: SendStatus
  error: string | undefined
  isSuccessOpen: boolean
  onClose: () => void
  promoteData?: PromoteData
  isPromoteDataLoading: boolean
}

export const PromoteUi: FC<PromoteUiProps> = ({
  token,
  submit,
  isTokenLoading,
  status,
  error,
  isSuccessOpen,
  onClose,
  promoteData,
  isPromoteDataLoading,
}) => {
  const [isResponsive, setIsResponsive] = useState(false)
  const [isInfoScreen, setIsInfoScreen] = useState(false)
  const {
    watch,
    formState: { errors },
  } = useFormContext()

  const amount = watch("amount")

  const isDisabled =
    Boolean(errors["amount"]?.message) ||
    !amount ||
    isPromoteDataLoading ||
    !promoteData

  if (isTokenLoading || !token || isPromoteDataLoading || !promoteData)
    return (
      <BlurredLoader
        isLoading
        overlayClassnames="rounded-[24px] max-h-full"
        loadingMessage="Fetching your promotion details"
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
          <PromoteSuccessUi
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
        <motion.div
          key="infoModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInfoScreen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ pointerEvents: isInfoScreen ? "auto" : "none" }}
          className="absolute top-0 left-0 w-full h-full bg-white z-[10] p-5 dark:bg-zinc-800"
        >
          <div>
            <div className="flex items-center gap-2 mb-[18px] dark:text-white">
              <ArrowLeft
                className="cursor-pointer dark:text-white"
                onClick={() => setIsInfoScreen(false)}
              />
              <div className="leading-10 text-[20px] font-bold">
                How promotion works
              </div>
            </div>
            <p className="text-sm leading-5">
              Once the transaction is executed, promoted application will
              immediately receive a dedicated banner pinned to the top of the
              Discovery page for a guaranteed 7 days.
            </p>
            <p className="my-5 text-sm leading-5">The Details:</p>
            <ul className="ml-5 text-sm leading-5 list-disc">
              <li>
                7-Day Guarantee: Your dApp is locked into the top spot for the
                first week.
              </li>
              <li>
                Open Rotation: After 7 days, other applications can be promoted
                to take its place.
              </li>
              <li>
                Up to 30 Days of Exposure: If no other dApp claims the spot,
                your application will keep this prime feature space
                automatically for up to 30 days total.
              </li>
            </ul>
          </div>
        </motion.div>
        <div className={clsx(isResponsive && "pb-[70px]")}>
          <div>
            <div className="flex items-center justify-between mb-[18px]">
              <div className="leading-10 text-[20px] font-bold">
                Promote {promoteData.dappName}
              </div>
              <InfoIcon
                className="text-black dark:text-white"
                onClick={() => setIsInfoScreen(true)}
              />
            </div>
            <p className="mt-2.5 mb-2.5 sm:mb-5 text-sm leading-5">
              Boost visibility by placing {promoteData.dappName} at the top of
              the NFID Wallet Discovery page.
            </p>
            <p className="mb-1 text-xs select-none dark:text-zinc-500">
              Amount to promote
            </p>
            <ChooseFromToken
              modalType={IModalType.PROMOTE}
              id={"promote-from-title"}
              token={token}
              usdRate={token.getTokenRateFormatted(amount)}
              value={amount}
              initialValue={String(promoteData.minAmount)}
              tokens={[]}
              minAmount={promoteData.minAmount}
              title="Amount to promote"
              isResponsive={isResponsive}
              setIsResponsive={setIsResponsive}
              fee={promoteData.fee}
            />
            <div className="h-4 mt-1 text-xs leading-4 text-red-600">
              {Boolean(errors["amount"]?.message) &&
                (errors["amount"]?.message as string)}
            </div>
            <Input
              type="text"
              disabled
              value={promoteData?.targetAddress}
              labelText="To"
              placeholder="{recipient wallet address or account ID}"
              inputClassName="!border-0 h-[56px] text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 !bg-gray-50 dark:!bg-zinc-700 dark:disabled:!text-zinc-400"
              labelClassName="!text-black dark:!text-zinc-500"
              className="mb-[10px]"
            />
            <div
              className={clsx(
                "flex justify-between text-xs text-gray-500 dark:text-zinc-500 font-inter",
              )}
            >
              <span className="leading-6">Network fee</span>
              {promoteData === undefined ? (
                <div className="text-right">
                  <Skeleton className="w-[70px] h-3 rounded-lg ml-auto" />
                  <Skeleton className="w-[50px] h-3 rounded-lg mt-1.5 ml-auto" />
                </div>
              ) : (
                <div className="text-right">
                  <div>{promoteData.feeFormatted}</div>
                  <div>{promoteData.feeUsdFormatted}</div>
                </div>
              )}
            </div>
            <Button
              className="absolute bottom-5 left-5 right-5 !w-auto"
              type="primary"
              id="swapTokensButton"
              block
              icon={
                !amount || errors["amount"] ? null : promoteData ===
                  undefined ? (
                  <Spinner className="w-5 h-5 text-white" />
                ) : null
              }
              disabled={isDisabled}
              onClick={submit}
            >
              Promote
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
