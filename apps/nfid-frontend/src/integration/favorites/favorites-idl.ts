import type { ActorMethod } from "@icp-sdk/core/agent"
import { IDL } from "@icp-sdk/core/candid"

/**
 * Favorites methods of `user_registry` (nfid-wallet-server#447).
 *
 * Hand-written because the generated bindings in `_ic_api/` are regenerated
 * by the engineer; switch to them once `user_registry.did` there includes
 * favorites.
 */
export interface RawFavorites {
  tokens: string[]
  contacts: string[]
}

export type RawFavoritesError =
  { EmptyId: null } | { IdTooLong: null } | { MaxFavoritesReached: null }

export type RawFavoritesResult =
  { Ok: RawFavorites } | { Err: RawFavoritesError }

export interface FavoritesActor {
  favorites_get: ActorMethod<[], RawFavorites>
  favorites_set_token: ActorMethod<[string, boolean], RawFavoritesResult>
  favorites_set_contact: ActorMethod<[string, boolean], RawFavoritesResult>
}

export const favoritesIdlFactory: IDL.InterfaceFactory = ({ IDL: I }) => {
  const Favorites = I.Record({
    tokens: I.Vec(I.Text),
    contacts: I.Vec(I.Text),
  })
  const FavoritesError = I.Variant({
    EmptyId: I.Null,
    IdTooLong: I.Null,
    MaxFavoritesReached: I.Null,
  })
  const Result = I.Variant({ Ok: Favorites, Err: FavoritesError })
  return I.Service({
    favorites_get: I.Func([], [Favorites], ["composite_query"]),
    favorites_set_token: I.Func([I.Text, I.Bool], [Result], []),
    favorites_set_contact: I.Func([I.Text, I.Bool], [Result], []),
  })
}
