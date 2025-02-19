import { getIdentity } from "apps/nfid-frontend/src/features/transfer-modal/utils"
import clsx from "clsx"
import { format } from "date-fns"
import { Spinner } from "packages/ui/src/atoms/spinner"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { TickerAmount } from "packages/ui/src/molecules/ticker-amount"
import { useState } from "react"
import { errorHandlerFactory } from "src/integration/swap/errors/handler-factory"
import { ContactSupportError } from "src/integration/swap/errors/types/contact-support-error"
import { ShroffIcpSwapImpl } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { icpSwapService } from "src/integration/swap/icpswap/service/icpswap-service"
import { KongSwapShroffImpl } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import {
  IconCmpArrow,
  IconCmpStatusSuccess,
  IconCmpSwapActivity,
  IconNftPlaceholder,
  IconSvgArrowRight,
  ImageWithFallback,
  Tooltip,
} from "@nfid-frontend/ui"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "frontend/features/activity/types"
import { useProfile } from "frontend/integration/identity-manager/queries"

interface ErrorStage {
  buttonText: string
  tooltipTitle: string
  tooltipMessage: string
}

export const getTooltipAndButtonText = (
  transaction: SwapTransaction | undefined,
): ErrorStage | undefined => {
  if (!transaction) return

  const stage = transaction.getStage()

  const swapStages = new Set([
    SwapStage.TransferSwap,
    SwapStage.Deposit,
    SwapStage.Swap,
  ])
  const withdrawStages = new Set([SwapStage.Withdraw, SwapStage.TransferNFID])

  if (stage === SwapStage.Completed || !transaction.getErrors().length) return

  if (
    transaction.getSwapName() === SwapName.Kongswap &&
    swapStages.has(stage)
  ) {
    return {
      buttonText: "Contact support",
      tooltipTitle: "swap",
      tooltipMessage: "Please contact support.",
    }
  }

  if (
    transaction.getSwapName() === SwapName.Kongswap &&
    withdrawStages.has(stage)
  ) {
    return {
      buttonText: "Complete swap",
      tooltipTitle: "swap",
      tooltipMessage: "Continue your swap.",
    }
  }

  if (stage === SwapStage.Deposit || stage === SwapStage.TransferSwap) {
    return {
      buttonText: "Cancel swap",
      tooltipTitle: "deposit",
      tooltipMessage: "Cancel your swap and try again.",
    }
  }

  if (stage === SwapStage.Swap) {
    return {
      buttonText: "Continue swap",
      tooltipTitle: "swap",
      tooltipMessage: "Continue your swap.",
    }
  }

  if (stage === SwapStage.Withdraw || stage === SwapStage.TransferNFID) {
    return {
      buttonText: "Complete swap",
      tooltipTitle: "withdraw",
      tooltipMessage: "Complete your swap.",
    }
  }

  throw new Error("Unexpected Stage")
}

interface IActivityTableRow extends IActivityRow {
  id: string
}

export const StatusIcons = {
  Success: <IconCmpStatusSuccess />,
}

export const ActivityTableRow = ({
  action,
  asset,
  from,
  timestamp,
  to,
  id,
  transaction,
}: IActivityTableRow) => {
  const [isLoading, setIsLoading] = useState(false)
  const { profile } = useProfile()

  const providerName =
    transaction?.getSwapName() && SwapName[transaction?.getSwapName()]

  const completeHandler = async () => {
    if (!transaction) return
    setIsLoading(true)

    let identity

    if (providerName === SwapName.ICPSwap) {
      const pool = await icpSwapService.getPoolFactory(
        transaction.getSourceLedger(),
        transaction.getTargetLedger(),
      )
      identity = await getIdentity([
        transaction.getSourceLedger(),
        transaction.getTargetLedger(),
        pool.canisterId.toText(),
        ...ShroffIcpSwapImpl.getStaticTargets(),
      ])
    } else {
      identity = await getIdentity([
        transaction.getSourceLedger(),
        transaction.getTargetLedger(),
        ...KongSwapShroffImpl.getStaticTargets(),
      ])
    }

    try {
      const errorHandler = errorHandlerFactory.getHandler(transaction)
      await errorHandler.completeTransaction(identity)
    } catch (e) {
      if (e instanceof ContactSupportError) {
        const email = "support@identitylabs.ooo"
        const subject = encodeURIComponent(`Swap via ${providerName} is failed`)
        const body = encodeURIComponent(
          `Hello NFID Wallet support team,\n\n` +
            `I cannot finalize my swap and would appreciate your immediate help with it!\n\n` +
            `**Swap details:**\n` +
            `- From: ${transaction.getSourceLedger()}\n` +
            `- To: ${transaction.getTargetLedger()}\n` +
            `- My NFID Wallet number: ${profile?.anchor}\n` +
            `- My wallet address: ${identity.getPrincipal().toText()}\n\n` +
            `Thanks,\n${profile?.name || ""}`,
        )

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip
      className={getTooltipAndButtonText(transaction) ? "" : "hidden"}
      align="start"
      alignOffset={20}
      arrowClassname="translate-x-[-330px] visible"
      tip={
        <span className="block max-w-[270px] sm:max-w-[320px]">
          <b>
            {providerName} {getTooltipAndButtonText(transaction)?.tooltipTitle}{" "}
            failed.
          </b>{" "}
          Something went wrong with the {providerName} service.{" "}
          {getTooltipAndButtonText(transaction)?.tooltipMessage}
        </span>
      }
    >
      <tr
        id={id}
        className="relative items-center text-sm activity-row hover:bg-gray-50"
      >
        <td className="flex items-center sm:pl-[30px] w-[30%]">
          <div
            className={clsx(
              "w-10 min-w-10 h-10 rounded-[9px] flex items-center justify-center relative",
              action === IActivityAction.SENT
                ? "bg-red-50"
                : action === IActivityAction.RECEIVED
                ? "bg-emerald-50"
                : "bg-violet-50",
            )}
          >
            {action === IActivityAction.SENT ? (
              <IconCmpArrow className="text-gray-400 rotate-[135deg] text-red-600" />
            ) : action === IActivityAction.RECEIVED ? (
              <IconCmpArrow className="text-gray-400 rotate-[-45deg] !text-emerald-600" />
            ) : (
              <>
                <IconCmpSwapActivity />
                {getTooltipAndButtonText(transaction) && (
                  <div
                    className={clsx(
                      "absolute right-0 bottom-0",
                      "w-3 h-3 rounded-full",
                      "border-2 border-white bg-red-600",
                    )}
                  ></div>
                )}
              </>
            )}
          </div>
          <div className="ml-2.5 mb-[11px] mt-[11px] shrink-0">
            <p
              id={"activity-table-row-action"}
              className="font-semibold text-sm leading-[20px]"
            >
              {action}
            </p>
            <p
              id={"activity-table-row-date"}
              className="text-xs text-gray-400 leading-[20px]"
            >
              {format(new Date(timestamp), "HH:mm:ss aaa")}
            </p>
          </div>
        </td>
        <td
          className={clsx(
            "transition-opacity w-[20%] text-center",
            action !== IActivityAction.SWAP && "pl-[28px]",
          )}
        >
          {action === IActivityAction.SWAP && asset?.type === "ft" ? (
            <div className="flex items-center justify-center gap-[8px]">
              <ImageWithFallback
                alt="NFID token"
                fallbackSrc={IconNftPlaceholder}
                src={asset.icon!}
                className="rounded-full w-[28px] h-[28px]"
              />
              <TickerAmount
                value={asset.amount}
                decimals={asset.decimals}
                symbol={asset.currency}
              />
            </div>
          ) : (
            <CopyAddress address={from} leadingChars={6} trailingChars={4} />
          )}
        </td>
        <td className="w-[34px] h-[24px] m-auto">
          <img src={IconSvgArrowRight} alt="" />
        </td>
        <td
          className={clsx(
            "transition-opacity w-[20%] text-center",
            action !== IActivityAction.SWAP && "pl-[28px]",
          )}
        >
          {action === IActivityAction.SWAP && asset?.type === "ft" ? (
            <div className="flex items-center justify-center gap-[8px]">
              <ImageWithFallback
                alt="NFID token"
                fallbackSrc={IconNftPlaceholder}
                src={asset.iconTo!}
                className="rounded-full w-[28px] h-[28px]"
              />
              <TickerAmount
                value={asset.amountTo!}
                decimals={asset.decimalsTo}
                symbol={asset.currencyTo!}
              />
            </div>
          ) : (
            <CopyAddress address={to} leadingChars={6} trailingChars={4} />
          )}
        </td>
        {asset?.type === "ft" ? (
          <td className="leading-5 text-right sm:text-center pr-5 sm:pr-[30px] w-[30%]">
            {getTooltipAndButtonText(transaction) ? (
              <>
                {isLoading || transaction?.getIsLoading() ? (
                  <Spinner className="w-[22px] h-[22px] text-gray-400 mx-auto" />
                ) : (
                  <span
                    className="cursor-pointer text-primaryButtonColor"
                    onClick={completeHandler}
                  >
                    {getTooltipAndButtonText(transaction)?.buttonText}
                  </span>
                )}
              </>
            ) : (
              <>
                <p className="text-sm">
                  <TickerAmount
                    value={asset.amount}
                    decimals={asset.decimals}
                    symbol={asset.currency}
                  />
                </p>
                {Boolean(asset.rate) && (
                  <p className="text-xs text-gray-400">
                    <TickerAmount
                      value={asset.amount}
                      decimals={asset.decimals}
                      symbol={asset.currency}
                      usdRate={asset.rate}
                    />
                  </p>
                )}
              </>
            )}
          </td>
        ) : (
          <td className="leading-5 text-right sm:text-left">
            <div className="flex items-center">
              <img src={asset.preview} className="object-cover w-10 h-10" />
              <p className="ml-2.5 font-semibold">{asset.name}</p>
            </div>
          </td>
        )}
      </tr>
    </Tooltip>
  )
}
