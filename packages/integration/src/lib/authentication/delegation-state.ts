import { DelegationIdentity } from "@dfinity/identity"

import { delegationByScope } from "../internet-identity/get-delegation-by-scope"
import { getExpirationDelay } from "./get-expiration"

interface DelegationEntry {
  requestedAt: number
  delegation: DelegationIdentity
}

function createDelegationState() {
  const _delegationPromises = new Map<string, Promise<DelegationIdentity>>()
  const _delegationMap = new Map<string, DelegationEntry>()

  function _getKey(anchor: number, scope: string) {
    return `${anchor}:${scope}`
  }

  const _getDelegationPromise = (anchor: number, scope: string) => {
    return _delegationPromises.get(_getKey(anchor, scope))
  }
  const _setDelegationPromise = (
    anchor: number,
    scope: string,
    delegationPromise: Promise<DelegationIdentity>,
  ) => {
    return _delegationPromises.set(_getKey(anchor, scope), delegationPromise)
  }

  const _getDelegationFromClosure = (
    anchor: number,
    scope: string,
  ): DelegationIdentity | undefined => {
    console.debug("createDelegationState _getDelegationFromClosure", {
      anchor,
      scope,
    })
    return _delegationMap.get(_getKey(anchor, scope))?.delegation
  }

  const _addDelegationToClosure = (
    anchor: number,
    scope: string,
    delegation: DelegationEntry,
  ): void => {
    _delegationMap.set(_getKey(anchor, scope), delegation)
  }

  async function _setupRefreshingDelegation(
    anchor: number,
    scope: string,
    maxTimeToLive: bigint,
  ) {
    console.debug("createDelegationState _setupRefreshingDelegation", {
      anchor,
      scope,
    })
    const delegation = await delegationByScope(
      Number(anchor),
      scope,
      maxTimeToLive,
    )
    const expiresIn = getExpirationDelay(delegation)
    const timeout = Math.floor(expiresIn * 0.8)

    const now = Date.now()
    console.debug("createDelegationState _setupRefreshingDelegation", {
      expiresIn: new Date(now + expiresIn).toISOString(),
      timeout: new Date(now + timeout).toISOString(),
    })

    const timer = setTimeout(() => {
      console.debug(
        "createDelegationState _setupRefreshingDelegation timeout",
        { anchor, scope },
      )
      _setupRefreshingDelegation(anchor, scope, maxTimeToLive)
    }, timeout)
    window.addEventListener("beforeunload", () => clearTimeout(timer))
    return delegation
  }

  async function getDelegation(
    anchor: number,
    scope: string,
    maxTimeToLive: bigint,
  ): Promise<DelegationIdentity> {
    const delegationFromClosure = _getDelegationFromClosure(anchor, scope)

    if (delegationFromClosure) {
      console.debug("createDelegationState getDelegation from state", {
        anchor,
        scope,
      })
      return delegationFromClosure
    }

    const delegationPromise = _getDelegationPromise(anchor, scope)
    if (delegationPromise) {
      console.debug("createDelegationState getDelegation promise", {
        anchor,
        scope,
      })
      return await delegationPromise
    }

    const requestedAt = Date.now()

    const newDelegationPromise = new Promise<DelegationIdentity>(
      (resolve, reject) => {
        const delegation = _setupRefreshingDelegation(
          anchor,
          scope,
          maxTimeToLive,
        )
          .then((delegation) => {
            resolve(delegation)
            _addDelegationToClosure(anchor, scope, {
              requestedAt,
              delegation,
            })
          })
          .catch((error) => reject(error))

        return delegation
      },
    )
    _setDelegationPromise(anchor, scope, newDelegationPromise)
    return newDelegationPromise
  }

  return { getDelegation }
}

export const delegationState = createDelegationState()
