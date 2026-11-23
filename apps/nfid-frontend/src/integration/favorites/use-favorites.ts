import { useCallback } from "react"
import toaster from "packages/ui/src/atoms/toast"

import { mutate, useSWR } from "@nfid/swr"

import {
  EMPTY_FAVORITES,
  FavoriteKind,
  Favorites,
  favoritesService,
} from "./favorites-service"

const FAVORITES_KEY = "favorites"

const toggled = (
  favorites: Favorites,
  kind: FavoriteKind,
  id: string,
  favorite: boolean,
): Favorites => {
  const field = kind === "token" ? "tokens" : "contacts"
  const list = favorites[field].filter((x) => x !== id)
  return { ...favorites, [field]: favorite ? [...list, id] : list }
}

export interface UseFavorites {
  favorites: Favorites
  isLoading: boolean
  toggle: (kind: FavoriteKind, id: string) => Promise<void>
}

/**
 * The user's favorites with an optimistic toggle: the UI updates at once and
 * rolls back with an error toast if the canister call fails. Pass
 * `enabled = false` in view-only mode, for vaults and private accounts.
 */
export const useFavorites = (enabled = true): UseFavorites => {
  const { data, isLoading } = useSWR(
    enabled ? FAVORITES_KEY : null,
    () =>
      favoritesService.get(
        (fresh) => void mutate(FAVORITES_KEY, fresh, { revalidate: false }),
      ),
    { revalidateOnFocus: false },
  )
  const favorites = data ?? EMPTY_FAVORITES

  const toggle = useCallback(
    async (kind: FavoriteKind, id: string) => {
      const list = kind === "token" ? favorites.tokens : favorites.contacts
      const favorite = !list.includes(id)
      const previous = favorites
      await mutate(FAVORITES_KEY, toggled(favorites, kind, id, favorite), {
        revalidate: false,
      })
      try {
        const saved = await favoritesService.set(kind, id, favorite)
        await mutate(FAVORITES_KEY, saved, { revalidate: false })
      } catch (e) {
        console.error("Failed to update favorites", e)
        await mutate(FAVORITES_KEY, previous, { revalidate: false })
        toaster.error("Couldn't update favorites. Please try again.")
      }
    },
    [favorites],
  )

  return { favorites, isLoading, toggle }
}
