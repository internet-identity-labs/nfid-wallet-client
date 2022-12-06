import { HttpAgent, SignIdentity } from "@dfinity/agent"

import { DIP20, DIP20IDLFactory } from "."
import { actor, agentBaseConfig } from "../../actors"

export const makeDip20Actor = (canisterId: string, identity?: SignIdentity) =>
  actor<DIP20>(
    canisterId,
    DIP20IDLFactory,
    identity
      ? { agent: new HttpAgent({ ...agentBaseConfig, identity }) }
      : undefined,
  )
