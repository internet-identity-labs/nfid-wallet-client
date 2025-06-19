import { useContext } from "react"

import { BtcAddressContext } from "frontend/contexts"

export const useBtcAddress = () => {
  const ctx = useContext(BtcAddressContext)
  if (!ctx) {
    throw new Error("useBtcAddress must be used within <BtcAddressProvider>")
  }
  return ctx
}
