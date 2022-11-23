import * as RadixTooltip from "@radix-ui/react-tooltip"
import React from "react"
import { HelmetProvider } from "react-helmet-async"

interface ProviderProps {
  children: React.ReactNode
}
export const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
    </HelmetProvider>
  )
}
