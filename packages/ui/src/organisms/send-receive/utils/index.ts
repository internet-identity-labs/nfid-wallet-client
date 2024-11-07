import { Principal } from "@dfinity/principal"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { DisplayFormat } from "frontend/integration/entrepot/types"
import { FT } from "frontend/integration/ft/ft"
import {
  DepositError,
  SwapError,
  WithdrawError,
} from "frontend/integration/icpswap/errors"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

import { getUserPrincipalId } from "../../tokens/utils"

export const getTokenOptions = async (tokens: FT[]) => {
  return await Promise.all(
    tokens.map(async (token) => {
      const usdBalance = await token.getTokenRate(
        token.getTokenBalanceFormatted() || "0",
      )

      return {
        label: token.getTokenName(),
        options: [
          {
            icon: {
              format: "img" as DisplayFormat,
              url: token.getTokenLogo() || "",
            },
            value: token.getTokenAddress(),
            title: token.getTokenSymbol(),
            subTitle: token.getTokenName(),
            innerTitle: `${
              token.getTokenBalanceFormatted() || "0"
            } ${token.getTokenSymbol()}`,
            innerSubtitle:
              usdBalance === undefined
                ? "Not listed"
                : usdBalance === 0
                ? "0.00 USD"
                : `${usdBalance.toString()} USD`,
          },
        ],
      }
    }),
  )
}

export const getAllTokenOptions = (tokens: FT[]) => {
  return tokens.map((token) => {
    return {
      label: token.getTokenName(),
      options: [
        {
          icon: {
            format: "img" as DisplayFormat,
            url: token.getTokenLogo() || "",
          },
          value: token.getTokenAddress(),
          title: token.getTokenSymbol(),
          subTitle: token.getTokenName(),
          innerTitle: undefined,
          innerSubtitle: undefined,
        },
      ],
    }
  })
}

export const getUpdatedTokenOptions = async (
  tokens: FT[],
  tokensLimitToInit: number,
) => {
  const { publicKey } = await getUserPrincipalId()
  const tokensToInit = tokens.slice(0, tokensLimitToInit)
  const tokensUninitialized = tokens.slice(tokensLimitToInit)

  const initedTokens = await Promise.all(
    tokensToInit.map(async (token) => {
      await token.init(Principal.fromText(publicKey))
      return token
    }),
  )

  const initedTokensWithOptions = await getTokenOptions(initedTokens)

  const uninitializedTokenOptions = getAllTokenOptions(tokensUninitialized)

  const allTokensWithOptions = [
    ...initedTokensWithOptions,
    ...uninitializedTokenOptions,
  ]

  return allTokensWithOptions
}

export const getTokenOptionsVault = async (tokens: FT[]) => {
  const options = await getTokenOptions(tokens)
  return options.filter((option) => option.options[0].value === ICP_CANISTER_ID)
}

export const getAllTokenPaginatedOptions = async (
  tokens: FT[],
  limit: number,
  skip: number,
) => {
  const { publicKey } = await getUserPrincipalId()
  const paginatedTokens = tokens.slice(skip, limit)

  return await Promise.all(
    paginatedTokens.map(async (token) => {
      token.init(Principal.fromText(publicKey))

      const balance = token.getTokenBalanceFormatted() || "0"
      const usdBalance = await token.getTokenRate(balance || "0")

      return {
        label: token.getTokenName(),
        options: [
          {
            icon: {
              format: "img" as DisplayFormat,
              url: token.getTokenLogo() || "",
            },
            value: token.getTokenAddress(),
            title: token.getTokenSymbol(),
            subTitle: token.getTokenName(),
            innerTitle: `${balance} ${token.getTokenSymbol()}`,
            innerSubtitle:
              usdBalance === undefined
                ? "Not listed"
                : usdBalance === 0
                ? "0.00 USD"
                : `${usdBalance.toString()} USD`,
          },
        ],
      }
    }),
  )
}

export const getTitleAndButtonText = (
  error: SwapError | WithdrawError | DepositError | undefined,
) => {
  if (error instanceof DepositError)
    return {
      title: "deposit",
      buttonText: "Close",
    }
  if (error instanceof SwapError)
    return {
      title: "swap",
      buttonText: "Close",
    }
  if (error instanceof WithdrawError)
    return {
      title: "withdraw",
      buttonText: "Complete swap",
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
