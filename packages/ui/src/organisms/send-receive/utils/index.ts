import BigNumber from "bignumber.js"
import { WIDGET_FEE } from "src/integration/swap/calculator/calculator-abstract"
import {
  DepositError,
  SlippageSwapError,
  SwapError,
  WithdrawError,
} from "src/integration/swap/errors/types"
import { SwapStage } from "src/integration/swap/types/enums"

import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_CANISTER_ID,
  ETH_NATIVE_ID,
} from "@nfid/integration/token/constants"

import {
  BtcToCkBtcFee,
  CkBtcToBtcFee,
} from "frontend/integration/bitcoin/bitcoin.service"
import { FT } from "frontend/integration/ft/ft"
import { e8s } from "frontend/integration/nft/constants/constants"
import { ContactSupportError } from "frontend/integration/swap/errors/types/contact-support-error"

export interface IConversionFee {
  total: string
  btcNetworkFee: string
  icpNetworkFee: string
  widgetFee: string
}

export enum IModalType {
  SWAP = "SWAP",
  SEND = "SEND",
  STAKE = "STAKE",
  CONVERT_TO_BTC = "CONVERT_TO_BTC",
  CONVERT_TO_CKBTC = "CONVERT_TO_CKBTC",
  CONVERT_TO_ETH = "CONVERT_TO_ETH",
  CONVERT_TO_CKETH = "CONVERT_TO_CKETH",
}

export const getTitleAndButtonText = (
  error:
    | SwapError
    | WithdrawError
    | DepositError
    | SlippageSwapError
    | ContactSupportError
    | undefined,
) => {
  if (error instanceof DepositError)
    return {
      title: "deposit",
      buttonText: "Close",
    }
  if (error instanceof SwapError || error instanceof SlippageSwapError)
    return {
      title: "swap",
      buttonText: "Close",
    }
  if (error instanceof WithdrawError)
    return {
      title: "withdraw",
      buttonText: "Complete swap",
    }
  if (error instanceof ContactSupportError)
    return {
      title: "swap",
      buttonText: "Contact support",
    }
  return { title: "", buttonText: "Close" }
}

const textStatusByStep: { [key in SwapStage]: string } = {
  [SwapStage.TransferSwap]: "Depositing",
  [SwapStage.Deposit]: "Depositing",
  [SwapStage.Swap]: "Swapping",
  [SwapStage.Withdraw]: "Withdrawing",
  [SwapStage.TransferNFID]: "Withdrawing",
  [SwapStage.Completed]: "",
}

export const getTextStatusByStep = (step: SwapStage) =>
  textStatusByStep[step] || ""

export const getBtcConversionFee = (fee?: BtcToCkBtcFee | CkBtcToBtcFee) => {
  if (!fee || fee.bitcointNetworkFee.fee_satoshis === BigInt(0)) return

  const {
    bitcointNetworkFee: { fee_satoshis },
    interNetwokFee,
    conversionFee,
  } = fee

  const identityLabsFee =
    "identityLabsFee" in fee ? fee.identityLabsFee : BigInt(0)

  const totalFee =
    fee_satoshis + interNetwokFee + conversionFee + identityLabsFee

  return {
    total: BigNumber(totalFee.toString()).div(e8s).toString(),
    btcNetworkFee: BigNumber(fee_satoshis.toString()).div(e8s).toString(),
    icpNetworkFee: BigNumber((interNetwokFee + conversionFee).toString())
      .div(e8s)
      .toString(),
    widgetFee: BigNumber(identityLabsFee.toString()).div(e8s).toString(),
  }
}

export const getFormattedPeriod = (value?: number, fullName?: boolean) => {
  if (value === undefined) return ""
  if (value === 0) return "Less than a month"

  const years = Math.floor(value / 12)
  const months = value % 12

  const yearsString =
    years > 0
      ? fullName
        ? `${years} year${years > 1 ? "s" : ""}`
        : `${years}y`
      : ""

  const monthsString =
    months > 0
      ? fullName
        ? `${months} month${months > 1 ? "s" : ""}`
        : `${months}m`
      : ""

  return [yearsString, monthsString].filter(Boolean).join(", ")
}

export const getMaxAmountFee = (
  sourceAmount: bigint,
  sourceFee: bigint,
): bigint => {
  const tokenFee = new BigNumber(sourceFee.toString()).multipliedBy(3)
  const amount = new BigNumber(sourceAmount.toString())
  const widgetFee = new BigNumber(WIDGET_FEE)
  const divisor = new BigNumber(1).plus(widgetFee)
  const fee = amount.minus(tokenFee).dividedBy(divisor)

  return BigInt(amount.minus(fee).toFixed(0))
}

export const getModalType = (fromToken?: FT, toToken?: FT) => {
  switch (true) {
    case fromToken?.getTokenAddress() === BTC_NATIVE_ID &&
      toToken?.getTokenAddress() === CKBTC_CANISTER_ID:
      return IModalType.CONVERT_TO_CKBTC

    case fromToken?.getTokenAddress() === CKBTC_CANISTER_ID &&
      toToken?.getTokenAddress() === BTC_NATIVE_ID:
      return IModalType.CONVERT_TO_BTC

    case fromToken?.getTokenAddress() === ETH_NATIVE_ID &&
      toToken?.getTokenAddress() === CKETH_CANISTER_ID:
      return IModalType.CONVERT_TO_CKETH

    case fromToken?.getTokenAddress() === CKETH_CANISTER_ID &&
      toToken?.getTokenAddress() === ETH_NATIVE_ID:
      return IModalType.CONVERT_TO_ETH

    default:
      return IModalType.CONVERT_TO_CKBTC
  }
}
