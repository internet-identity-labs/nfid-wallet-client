import BigNumber from "bignumber.js"

import { ETH_DECIMALS, TRIM_ZEROS } from "@nfid/integration/token/constants"
import {
  ChainId,
  getEvmGasTokenSymbol,
} from "@nfid/integration/token/icrc1/enum/enums"

import { formatUsdAmount } from "frontend/util/format-usd-amount"

import InvalidIcon from "./assets/invalid.svg"
import UnknownIcon from "./assets/unverified.svg"
import ValidIcon from "./assets/valid.svg"
import { ValidationStatus } from "./types"

export const formatValue = (value?: string, chainId?: ChainId): string => {
  const gasTokenSymbol = getEvmGasTokenSymbol(chainId || ChainId.ETH)
  if (!value || value === "0x" || value === "0x0" || value === "0") {
    return `0 ${gasTokenSymbol}`
  }
  try {
    const wei = BigInt(value.startsWith("0x") ? value : `0x${value}`)
    const eth = Number(wei) / 10 ** ETH_DECIMALS
    return `${eth.toFixed(ETH_DECIMALS).replace(TRIM_ZEROS, "")} ${gasTokenSymbol}`
  } catch {
    return value
  }
}

export const formatGasPrice = (
  totalGas?: string,
  chainId?: ChainId,
): string | undefined => {
  if (!totalGas) return
  const gasTokenSymbol = getEvmGasTokenSymbol(chainId || ChainId.ETH)

  return `${new BigNumber(totalGas)
    .dividedBy(10 ** ETH_DECIMALS)
    .toFixed(ETH_DECIMALS)
    .replace(TRIM_ZEROS, "")} ${gasTokenSymbol}`
}

export const formatUsdPrice = (
  rate?: BigNumber,
  amount?: string,
): string | undefined => {
  if (!amount || !rate) return
  const value = rate.multipliedBy(
    BigNumber(amount).dividedBy(10 ** ETH_DECIMALS),
  )

  return formatUsdAmount(value)
}

export const formatTotalUsdPrice = (
  rate?: BigNumber,
  value?: string,
  totalGas?: string,
): string | undefined => {
  if (!value || !rate || !totalGas) return

  let amount
  let gas

  try {
    const wei = BigInt(value.startsWith("0x") ? value : `0x${value}`)
    const eth = Number(wei) / 10 ** ETH_DECIMALS
    const fee = new BigNumber(totalGas).dividedBy(10 ** ETH_DECIMALS)
    amount = eth
    gas = fee
  } catch {
    return value
  }

  const total = gas.plus(amount)
  const formattedTotal = rate.multipliedBy(total)

  return formatUsdAmount(formattedTotal)
}

export const formatTotal = (
  totalGas?: string,
  value?: string,
  chainId?: ChainId,
) => {
  const gasTokenSymbol = getEvmGasTokenSymbol(chainId || ChainId.ETH)

  if (
    !totalGas ||
    !value ||
    value === "0x" ||
    value === "0x0" ||
    value === "0"
  ) {
    return `0 ${gasTokenSymbol}`
  }

  let amount
  let gas

  try {
    const wei = BigInt(value.startsWith("0x") ? value : `0x${value}`)
    const eth = Number(wei) / 10 ** ETH_DECIMALS
    const fee = new BigNumber(totalGas).dividedBy(10 ** ETH_DECIMALS)
    amount = eth
    gas = fee
  } catch {
    return value
  }

  const total = gas.plus(amount)
  return `${total.toFixed(ETH_DECIMALS).replace(TRIM_ZEROS, "")} ${gasTokenSymbol}`
}

export const getDAppHostname = (origin: string): string => {
  try {
    if (origin) {
      return new URL(origin).hostname
    }
  } catch {
    return origin || "Unknown"
  }
  return "Unknown"
}

export function getNetworkName(chainId: string): string {
  const chainIdMap: Record<string, string> = {
    "eip155:1": "Ethereum",
    "eip155:137": "Polygon",
    "eip155:56": "BNB Smart Chain",
    "eip155:8453": "Base",
    "eip155:42161": "Arbitrum",
    "eip155:11155111": "Sepolia",
  }

  return chainIdMap[chainId] || chainId
}

export function getNetworkId(chainId: string): ChainId {
  const chainIdMap: Record<string, ChainId> = {
    "eip155:1": ChainId.ETH,
    "eip155:137": ChainId.POL,
    "eip155:56": ChainId.BNB,
    "eip155:8453": ChainId.BASE,
    "eip155:42161": ChainId.ARB,
  }

  return chainIdMap[chainId] || ChainId.ETH
}

export function getStatusIcon(validationStatus: ValidationStatus): string {
  switch (validationStatus) {
    case "VALID":
      return ValidIcon

    case "UNKNOWN":
      return UnknownIcon

    case "INVALID":
      return InvalidIcon
  }
}

export function getStatusText(validationStatus: ValidationStatus): {
  title: string
  text: string
} {
  switch (validationStatus) {
    case "VALID":
      return {
        title: "Domain match",
        text: "The domain linked to this request has been verified as this application’s domain.",
      }

    case "UNKNOWN":
      return {
        title: "Unverified",
        text: "The domain sending the request cannot be verified.",
      }

    case "INVALID":
      return {
        title: "Threat",
        text: "This domain is flagged as malicious and potentially harmful.",
      }
  }
}

export const renderTypedDataFields = (data: any, level = 0): JSX.Element[] => {
  const fields: JSX.Element[] = []

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        fields.push(
          <div key={key}>
            <div className="py-1.5 font-bold">{key}</div>
            <div className="ml-[10px]">
              {renderTypedDataFields(value, level + 1)}
            </div>
          </div>,
        )
      } else {
        fields.push(
          <div key={key} className="flex gap-1.5 py-1.5">
            <span className="flex-[0_0_40%]">{key}</span>
            <span className="break-all flex-[0_0_60%]">{String(value)}</span>
          </div>,
        )
      }
    }
  }

  return fields
}
