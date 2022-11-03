import useSWR from "swr"

import { ii } from "frontend/integration/actors"

const healthCheck = async () => {
  try {
    await ii.lookup(BigInt(1982607))
    return false
  } catch {
    return true
  }
}

export const useMaintenance = () => {
  const { data: isDown } = useSWR("healthCheck", healthCheck, {
    refreshInterval: 60000,
  })

  return {
    isDown: isDown ?? false,
  }
}
