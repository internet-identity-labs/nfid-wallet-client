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
  IconCmpBurnActivity,
  IconCmpMintActivity,
  IconCmpApproveActivity,
  IconNftPlaceholder,
  IconSvgArrowRight,
  ImageWithFallback,
  Tooltip,
} from "@nfid-frontend/ui"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "frontend/features/activity/types"
import { FT } from "frontend/integration/ft/ft"
import { APPROXIMATE_SWAP_DURATION } from "frontend/integration/swap/transaction/transaction-service"

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

  if (stage === SwapStage.Completed) return

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

export const getActionMarkup = (
  action: IActivityAction,
  transaction: SwapTransaction | undefined,
) => {
  switch (action) {
    case IActivityAction.SENT:
      return {
        bg: "bg-red-50",
        icon: <IconCmpArrow className="rotate-[135deg] text-red-600" />,
      }

    case IActivityAction.RECEIVED:
      return {
        bg: "bg-emerald-50",
        icon: <IconCmpArrow className="rotate-[-45deg] text-emerald-600" />,
      }

    case IActivityAction.SWAP:
      return {
        bg: "bg-violet-50",
        icon: (
          <>
            <IconCmpSwapActivity />
            {getTooltipAndButtonText(transaction) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-600 border-2 border-white rounded-full" />
            )}
          </>
        ),
      }

    case IActivityAction.MINT:
      return {
        bg: "bg-emerald-50",
        icon: <IconCmpMintActivity className="text-emerald-600" />,
      }

    case IActivityAction.BURN:
      return {
        bg: "bg-red-50",
        icon: <IconCmpBurnActivity className="text-emerald-600" />,
      }

    case IActivityAction.APPROVE:
      return {
        bg: "bg-emerald-50",
        icon: <IconCmpApproveActivity className="text-emerald-600" />,
      }

    default:
      return {
        bg: "bg-gray-100",
        icon: null,
      }
  }
}

interface IActivityTableRow extends IActivityRow {
  id: string
  token?: FT
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
  token,
}: IActivityTableRow) => {
  const [isLoading, setIsLoading] = useState(false)

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
        window.open("https://discord.com/invite/a9BFNrYJ99", "_blank")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (
    transaction &&
    transaction?.getStage() !== SwapStage.Completed &&
    !transaction?.getErrors().length &&
    Date.now() - Number(transaction?.getStartTime()) <=
      APPROXIMATE_SWAP_DURATION
  )
    return null

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
        <td className="flex items-center sm:pl-[30px] w-[156px] sm:w-[30%]">
          <div
            className={clsx(
              "w-10 min-w-10 h-10 rounded-[9px] flex items-center justify-center relative",
              getActionMarkup(action, transaction).bg,
            )}
          >
            {getActionMarkup(action, transaction).icon}
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

        {![
          IActivityAction.APPROVE,
          IActivityAction.MINT,
          IActivityAction.BURN,
        ].includes(action) ? (
          <>
            <td
              className={clsx(
                "transition-opacity w-[20%] hidden sm:table-cell pl-[28px]",
              )}
            >
              {action === IActivityAction.SWAP && asset?.type === "ft" ? (
                <div className="flex items-center gap-[8px]">
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
                <CopyAddress
                  address={from}
                  leadingChars={6}
                  trailingChars={4}
                />
              )}
            </td>
            <td className="w-[34px] h-[24px] m-auto hidden sm:table-cell">
              <img src={IconSvgArrowRight} alt="" />
            </td>
            <td
              className={clsx(
                "transition-opacity w-[20%] hidden sm:table-cell pl-[28px]",
              )}
            >
              {action === IActivityAction.SWAP && asset?.type === "ft" ? (
                <div className="flex items-center gap-[8px]">
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
          </>
        ) : (
          <>
            {action === IActivityAction.APPROVE ? (
              <>
                <td
                  className={clsx(
                    "transition-opacity w-[20%] hidden sm:table-cell pl-[28px]",
                  )}
                >
                  <CopyAddress
                    address={from}
                    leadingChars={6}
                    trailingChars={4}
                  />
                </td>
                <td className="w-[34px] h-[24px] m-auto hidden sm:table-cell">
                  <img src={IconSvgArrowRight} alt="" />
                </td>
                <td
                  className={clsx(
                    "transition-opacity w-[20%] hidden sm:table-cell pl-[28px]",
                  )}
                >
                  <CopyAddress
                    address={to}
                    leadingChars={6}
                    trailingChars={4}
                  />
                </td>
              </>
            ) : (
              <td
                colSpan={3}
                className={clsx(
                  "transition-opacity w-[20%] hidden sm:table-cell pl-[28px]",
                )}
              >
                <div className="flex items-center gap-2">
                  <ImageWithFallback
                    alt={`${token?.getTokenSymbol()} token`}
                    fallbackSrc={IconNftPlaceholder}
                    src={token?.getTokenLogo()}
                    className="rounded-full w-[28px] h-[28px]"
                  />
                  <TickerAmount
                    value={asset.amount!}
                    decimals={token?.getTokenDecimals()}
                    symbol={token?.getTokenSymbol()!}
                  />
                </div>
              </td>
            )}
          </>
        )}
        {asset?.type === "ft" ? (
          <td className="leading-5 pr-5 sm:pr-[30px] min-w-[60%] sm:min-w-auto sm:w-[30%] text-left sm:text-center">
            <div className="flex items-center text-left">
              {action === IActivityAction.SWAP && (
                <div className="mr-[24px] flex sm:hidden w-[28px]">
                  <ImageWithFallback
                    alt="NFID token"
                    fallbackSrc={IconNftPlaceholder}
                    src={asset.icon!}
                    className="rounded-full w-[28px] h-[28px]"
                  />
                  <ImageWithFallback
                    alt="NFID token"
                    fallbackSrc={IconNftPlaceholder}
                    src={asset.iconTo!}
                    className="rounded-full w-[28px] h-[28px] relative z-[1] ml-[-14px]"
                  />
                </div>
              )}
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
                <div className="flex flex-col">
                  <p className="text-sm whitespace-nowrap">
                    <TickerAmount
                      value={asset.amount}
                      decimals={asset.decimals}
                      symbol={asset.currency}
                    />
                  </p>
                  {Boolean(asset.rate) && (
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      <TickerAmount
                        value={asset.amount}
                        decimals={asset.decimals}
                        symbol={asset.currency}
                        usdRate={asset.rate}
                      />
                    </p>
                  )}
                </div>
              )}
            </div>
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
