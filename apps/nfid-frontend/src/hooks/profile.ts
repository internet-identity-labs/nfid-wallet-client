import { useEffect, useState } from "react"

import { loadProfileFromStorage, Profile } from "@nfid/integration"

export function useLoadProfileFromStorage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | undefined>()

  useEffect(() => {
    setLoading(true)
    loadProfileFromStorage()
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [])

  return {
    storageProfile: profile,
    storageProfileLoading: loading,
  }
}
