import { Actor, ActorSubclass } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"

import { ttlCacheService } from "@nfid/client-db"
import { authState } from "@nfid/integration"
import { createAgent } from "@nfid-frontend/utils"

import {
  FavoritesActor,
  favoritesIdlFactory,
  RawFavoritesResult,
} from "./favorites-idl"

export interface Favorites {
  /** Token ids, see `tokenFavoriteId`. */
  tokens: string[]
  /** Address book entry ids. */
  contacts: string[]
}

export type FavoriteKind = "token" | "contact"

export const FAVORITES_CACHE_NAME = "Favorites_"
const FAVORITES_TTL_MS = 60 * 60 * 1000

export const EMPTY_FAVORITES: Favorites = { tokens: [], contacts: [] }

/** Favorite id of a token: `<chainId>:<token address>`. */
export const tokenFavoriteId = (chainId: number, address: string): string =>
  `${chainId}:${address}`

const unwrap = (result: RawFavoritesResult): Favorites => {
  if ("Err" in result) {
    throw new Error(`Favorites: ${Object.keys(result.Err)[0]}`)
  }
  return { tokens: result.Ok.tokens, contacts: result.Ok.contacts }
}

/**
 * Favorite tokens and contacts, stored in `user_registry` per user so they are
 * the same on every device.
 */
export class FavoritesService {
  /**
   * The user's favorites, from cache at once and refreshed in the background.
   * `onRevalidated` is called when the refresh brings a different value.
   */
  async get(
    onRevalidated?: (favorites: Favorites) => void,
  ): Promise<Favorites> {
    return ttlCacheService.getOrFetch(
      await this.cacheKey(),
      async () => {
        const raw = await (await this.getActor()).favorites_get()
        return { tokens: raw.tokens, contacts: raw.contacts }
      },
      FAVORITES_TTL_MS,
      { revalidate: "always", onRevalidated },
    )
  }

  /** Marks `id` as favorite or not; returns and caches the new favorites. */
  async set(kind: FavoriteKind, id: string, favorite: boolean) {
    const actor = await this.getActor()
    const result =
      kind === "token"
        ? await actor.favorites_set_token(id, favorite)
        : await actor.favorites_set_contact(id, favorite)
    const favorites = unwrap(result)
    await ttlCacheService.getOrFetch(
      await this.cacheKey(),
      async () => favorites,
      FAVORITES_TTL_MS,
      { forceRefetch: true },
    )
    return favorites
  }

  private async cacheKey(): Promise<string> {
    const identity = authState.get().delegationIdentity
    if (!identity) throw new Error("Favorites: not signed in")
    return `${FAVORITES_CACHE_NAME}${identity.getPrincipal().toText()}`
  }

  private async getActor(): Promise<ActorSubclass<FavoritesActor>> {
    const identity = authState.get().delegationIdentity
    if (!identity) throw new Error("Favorites: not signed in")
    const agent = await createAgent({ identity, host: IC_HOST })
    return Actor.createActor<FavoritesActor>(favoritesIdlFactory, {
      agent,
      canisterId: Principal.fromText(USER_REGISTRY_CANISTER_ID),
    })
  }
}

export const favoritesService = new FavoritesService()
