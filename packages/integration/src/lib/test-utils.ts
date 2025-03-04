import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

export async function generateDelegationIdentity(identity: Ed25519KeyIdentity) {
  const sessionKey = Ed25519KeyIdentity.generate()
  const chain = await DelegationChain.create(
    identity,
    sessionKey.getPublicKey(),
    new Date(Date.now() + 3_600_000 * 44),
    {},
  )
  return {
    delegationIdentity: DelegationIdentity.fromDelegation(sessionKey, chain),
    sessionKey,
    chain,
  }
}

// A `hasOwnProperty` that produces evidence for the typechecker
export function hasOwnProperty<
  X extends Record<string, unknown>,
  Y extends PropertyKey,
>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export function stringify(
  value: any,
  replacer?: (number | string)[] | null,
  space: string | number = 2,
) {
  return JSON.stringify(value, replacer, space)
}

export const makeServiceMock = <T>(): {
  service: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason?: any) => void
} => {
  let resolve: any
  let reject: any

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    service: () => promise,
    resolve,
    reject,
  }
}
