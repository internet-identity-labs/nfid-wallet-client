import { CONFIG } from "frontend/config"
import React from "react"
import { Usergeek } from "usergeek-ic-js"

export const useUserGeek = (principalId?: string) => {
  React.useEffect((): void => {
    if (principalId) {
      console.log(">> useUserGeek", { principalId })

      Usergeek.init({ apiKey: CONFIG.USERGEEK_API_KEY as string })
    }
  }, [principalId])
}
