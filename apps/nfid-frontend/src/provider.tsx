import * as RadixTooltip from "@radix-ui/react-tooltip"
import { useInterpret } from "@xstate/react"
import React, { createContext } from "react"
import { HelmetProvider } from "react-helmet-async"
import { ParallaxProvider } from "react-scroll-parallax"

import {
  transferMachine,
  TransferMachineActor,
} from "./features/transfer-modal/machine"

interface ProviderProps {
  children: React.ReactNode
}

export const ProfileContext = createContext({
  transferService: {} as TransferMachineActor,
})

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  const transferService: TransferMachineActor = useInterpret(transferMachine)

  return (
    <ParallaxProvider>
      <HelmetProvider>
        <ProfileContext.Provider value={{ transferService }}>
          <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
        </ProfileContext.Provider>
      </HelmetProvider>
    </ParallaxProvider>
  )
}
