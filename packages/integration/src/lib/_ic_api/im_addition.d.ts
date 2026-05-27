import type { Principal } from "@icp-sdk/core/principal"

export interface _SERVICE {
  has_poap: () => Promise<boolean>
  increment_poap: () => Promise<undefined>
  ping: () => Promise<boolean>
}
