import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "frontend/integration/nft/impl/nft-types"

type State = {
  about: {
    data: string
    isLoading: boolean
    error: string | null
  }
  fullSize: {
    data: AssetPreview
    isLoading: boolean
    error: string | null
  }
  properties: {
    data: TokenProperties
    isLoading: boolean
    error: string | null
  }
  transactions: {
    data: NFTTransactions
    isLoading: boolean
    error: string | null
  }
}

type Action =
  | { type: "SET_ABOUT"; payload: string }
  | { type: "SET_FULL_SIZE"; payload: AssetPreview }
  | { type: "SET_PROPERTIES"; payload: TokenProperties }
  | { type: "SET_TRANSACTIONS"; payload: NFTTransactions }
  | {
      type: "SET_LOADING"
      key: "fullSize" | "properties" | "transactions" | "about"
      isLoading: boolean
    }
  | {
      type: "SET_ERROR"
      key: "fullSize" | "properties" | "transactions" | "about"
      payload: string
    }

export const nftInitialState = {
  about: { data: "", isLoading: true, error: null },
  fullSize: { data: {} as AssetPreview, isLoading: true, error: null },
  properties: { data: {} as TokenProperties, isLoading: true, error: null },
  transactions: { data: {} as NFTTransactions, isLoading: true, error: null },
}

export const nftReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ABOUT":
      return {
        ...state,
        about: { data: action.payload, isLoading: false, error: null },
      }
    case "SET_FULL_SIZE":
      return {
        ...state,
        fullSize: { data: action.payload, isLoading: false, error: null },
      }
    case "SET_PROPERTIES":
      return {
        ...state,
        properties: { data: action.payload, isLoading: false, error: null },
      }
    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: { data: action.payload, isLoading: false, error: null },
      }
    case "SET_LOADING":
      return {
        ...state,
        [action.key]: { ...state[action.key], isLoading: action.isLoading },
      }
    case "SET_ERROR":
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          error: action.payload,
        },
      }
    default:
      return state
  }
}
