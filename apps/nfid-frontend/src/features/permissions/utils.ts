import { AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"
import { FT } from "frontend/integration/ft/ft"
import { PAGE_SIZE } from "frontend/integration/ft/ft-service"

type PermissionsState = {
  page: number
  hasMore: boolean
  isLoadingMore: boolean
  allowancesList: { token: FT; allowance: AllowanceDetailDTO }[]
}

export type PermissionsStateAction =
  | {
      type: "RESET"
      payload: { list: { token: FT; allowance: AllowanceDetailDTO }[] }
    }
  | { type: "LOAD_MORE_START" }
  | {
      type: "LOAD_MORE_SUCCESS"
      payload: { list: { token: FT; allowance: AllowanceDetailDTO }[] }
    }
  | {
      type: "REMOVE_ALLOWANCE"
      payload: { token: FT; address: string }
    }

export const permissionsInitialState: PermissionsState = {
  page: 0,
  hasMore: false,
  isLoadingMore: false,
  allowancesList: [],
}

export const permissionsReducer = (
  state: PermissionsState,
  action: PermissionsStateAction,
): PermissionsState => {
  switch (action.type) {
    case "RESET": {
      const list = action.payload.list
      return {
        page: 1,
        hasMore: list.length === PAGE_SIZE,
        isLoadingMore: false,
        allowancesList: list,
      }
    }
    case "LOAD_MORE_START":
      return { ...state, isLoadingMore: true }

    case "LOAD_MORE_SUCCESS": {
      const list = [...state.allowancesList, ...action.payload.list]
      return {
        page: state.page + 1,
        hasMore: action.payload.list.length === PAGE_SIZE,
        isLoadingMore: false,
        allowancesList: list,
      }
    }

    case "REMOVE_ALLOWANCE": {
      const { token, address } = action.payload

      return {
        ...state,
        allowancesList: state.allowancesList.filter(
          (item) =>
            !(
              item.token.getTokenAddress() === token.getTokenAddress() &&
              item.allowance.to_spender === address
            ),
        ),
      }
    }

    default:
      return state
  }
}
