import * as Agent from "@dfinity/agent"
import { HttpAgent } from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"

import { agentBaseConfig } from "@nfid/integration"

import { WIDGET_FEE } from "../impl/quote-impl"

export function actorBuilder<T>(
  canisterId: string | Principal,
  factory: InterfaceFactory,
  config?: Partial<Agent.ActorConfig>,
): Agent.ActorSubclass<T> {
  return Agent.Actor.createActor(factory, {
    canisterId,
    agent: new HttpAgent({ ...agentBaseConfig, ...config }),
  })
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
