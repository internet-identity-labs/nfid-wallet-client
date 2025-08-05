import { DelegationIdentity } from "@dfinity/identity"

import { accessList } from "../actors"
import { getGlobalDelegation } from "../delegation-factory/delegation-i"
import { delegationByScope } from "../internet-identity/get-delegation-by-scope"
import { authState } from "./auth-state"
import { getExpirationDelay } from "./get-expiration"

class RefreshingDelegation {
  private _expirationPadding?: number
  private _timer?: NodeJS.Timeout
  private _delegation?: DelegationIdentity
  private _delegationPromise?: Promise<DelegationIdentity>
  private readonly _maxTimeToLive: bigint
  private readonly _scope: string
  private readonly _anchor: number

  constructor({
    scope,
    anchor,
    maxTimeToLive,
  }: {
    scope: string
    anchor: number
    maxTimeToLive: bigint
  }) {
    this._scope = scope
    this._anchor = anchor
    this._maxTimeToLive = maxTimeToLive
  }

  get isValid() {
    if (!this._delegation) return false
    if (!this._expirationPadding) return false

    const expirationDelay = getExpirationDelay(this._delegation)
    return expirationDelay >= this._expirationPadding
  }

  async _getDelegation(): Promise<DelegationIdentity> {
    if (this._delegationPromise) {
      return this._delegationPromise
    }

    if (this._anchor < 100000000) {
      this._delegationPromise = delegationByScope(
        this._anchor,
        this._scope,
        this._maxTimeToLive,
      )
        .then((delegation) => {
          this._setupRefreshingDelay(delegation)
          this._delegation = delegation
          return delegation
        })
        .finally(() => {
          this._delegationPromise = undefined
        })
    } else {
      const deviceIdentity = authState.get().delegationIdentity
      if (!deviceIdentity) throw new Error("No device identity")

      this._delegationPromise = getGlobalDelegation(deviceIdentity, [])
        .then((delegation) => {
          this._setupRefreshingDelay(delegation)
          this._delegation = delegation
          return delegation
        })
        .finally(() => {
          this._delegationPromise = undefined
        })
    }

    return this._delegationPromise
  }

  async _setupRefreshingDelay(delegation: DelegationIdentity) {
    if (this._timer) clearTimeout(this._timer)

    const expiresIn = getExpirationDelay(delegation)
    this._expirationPadding = Math.floor(expiresIn * 0.2)
    const timeout = Math.floor(expiresIn - this._expirationPadding)

    const now = Date.now()
    console.debug("RefreshingDelegation _setupRefreshingDelay", {
      expiresAt: new Date(now + expiresIn),
      refreschingAt: new Date(now + timeout),
    })

    this._timer = setTimeout(() => {
      console.debug(
        "RefreshingDelegation timeout calling this._getDelegation",
        {
          scope: this._scope,
          anchor: this._anchor,
        },
      )
      this._getDelegation()
    }, timeout)
  }

  async getDelegation(): Promise<DelegationIdentity> {
    if (this.isValid) {
      return this._delegation as DelegationIdentity
    }
    return this._getDelegation()
  }
}

export function createDelegationState() {
  const _delegationMap = new Map<string, RefreshingDelegation>()

  function _getKey(anchor: number, scope: string) {
    return `${anchor}:${scope}`
  }

  const _getDelegationFromClosure = (
    anchor: number,
    scope: string,
  ): RefreshingDelegation | undefined => {
    console.debug("createDelegationState _getDelegationFromClosure", {
      anchor,
      scope,
    })
    return _delegationMap.get(_getKey(anchor, scope))
  }

  const _addDelegationToClosure = (
    anchor: number,
    scope: string,
    delegation: RefreshingDelegation,
  ): void => {
    _delegationMap.set(_getKey(anchor, scope), delegation)
  }

  async function getDelegation(
    anchor: number,
    scope: string,
    maxTimeToLive: bigint,
  ): Promise<DelegationIdentity> {
    const refreshingDelegation = _getDelegationFromClosure(anchor, scope)

    if (refreshingDelegation) {
      console.debug("createDelegationState getDelegation from state", {
        anchor,
        scope,
      })
      return refreshingDelegation.getDelegation()
    }

    const newRefreshDelegation = new RefreshingDelegation({
      scope,
      anchor,
      maxTimeToLive,
    })

    _addDelegationToClosure(anchor, scope, newRefreshDelegation)

    return newRefreshDelegation.getDelegation()
  }

  return { getDelegation }
}

export const delegationState = createDelegationState()
