import { hasOwnProperty } from "@nfid/integration"

import { Category } from "../../_ic_api/icrc1_oracle.d"
import { ICRC1State } from "../../_ic_api/user_registry.d"
import { Category as CategoryTS, State } from "./enum/enums"

export function mapCategory(category: Category): CategoryTS {
  if (hasOwnProperty(category, "Sns")) {
    return CategoryTS.Sns
  }
  if (hasOwnProperty(category, "Known")) {
    return CategoryTS.Known
  }
  if (hasOwnProperty(category, "Spam")) {
    return CategoryTS.Spam
  }
  if (hasOwnProperty(category, "ChainFusionTestnet")) {
    return CategoryTS.ChainFusionTestnet
  }
  if (hasOwnProperty(category, "ChainFusion")) {
    return CategoryTS.ChainFusion
  }
  if (hasOwnProperty(category, "Community")) {
    return CategoryTS.Community
  }
  if (hasOwnProperty(category, "Native")) {
    return CategoryTS.Native
  }
  throw new Error("Unknown category")
}

export function mapState(state: ICRC1State): State {
  if (hasOwnProperty(state, "Active")) {
    return State.Active
  }
  if (hasOwnProperty(state, "Inactive")) {
    return State.Inactive
  }
  throw new Error("Unknown state")
}

export function mapStateTS(state: State): ICRC1State {
  if (state === State.Active) {
    return { Active: null }
  }
  if (state === State.Inactive) {
    return { Inactive: null }
  }
  throw new Error("Unknown state")
}
