import { TransactionPrettified } from "@psychedelic/cap-js"
import { format } from "date-fns"

import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"

export interface ITransaction {
  from: string
  to: string
  datetime: string
  type: string
  price?: string
}

type State = {
  about: {
    data: string
    isLoading: boolean
  }
  fullSize: {
    data: AssetPreview
    isLoading: boolean
  }
  properties: {
    data: TokenProperties
    isLoading: boolean
  }
  transactions: {
    data: NFTTransactions
    isLoading: boolean
  }
  error: string | null
}

type Action =
  | { type: "SET_ABOUT"; payload: string }
  | { type: "SET_FULL_SIZE"; payload: AssetPreview }
  | { type: "SET_PROPERTIES"; payload: TokenProperties }
  | { type: "SET_TRANSACTIONS"; payload: NFTTransactions }
  | {
      type: "SET_LOADING"
      key: "fullSize" | "properties" | "transactions"
      isLoading: boolean
    }
  | { type: "SET_ERROR"; payload: string }

export const mapTransactionsForUI = (transactions: TransactionPrettified[]) => {
  return transactions.map((transaction) => {
    const details = transaction.details
    return {
      type: transaction.operation,
      datetime: format(
        new Date(Number(transaction.time)),
        "MMM dd, yyyy - hh:mm:ss aaa",
      ),
      from: transaction.from || "",
      to: transaction.to || "",
      price:
        details?.price && details?.price_currency && details?.price_decimals
          ? `${Number(details.price) / 10 ** Number(details.price_decimals)} ${
              details.price_currency
            }`
          : "",
    }
  })
}

export const nftInitialState = {
  about: { data: "", isLoading: true },
  fullSize: { data: {} as AssetPreview, isLoading: true },
  properties: { data: {} as TokenProperties, isLoading: true },
  transactions: { data: {} as NFTTransactions, isLoading: true },
  error: null,
}

export const nftReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ABOUT":
      return { ...state, about: { data: action.payload, isLoading: false } }
    case "SET_FULL_SIZE":
      return { ...state, fullSize: { data: action.payload, isLoading: false } }
    case "SET_PROPERTIES":
      return {
        ...state,
        properties: { data: action.payload, isLoading: false },
      }
    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: { data: action.payload, isLoading: false },
      }
    case "SET_LOADING":
      return {
        ...state,
        [action.key]: { ...state[action.key], isLoading: action.isLoading },
      }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    default:
      return state
  }
}
