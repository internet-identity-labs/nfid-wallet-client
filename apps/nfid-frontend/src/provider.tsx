import * as RadixTooltip from "@radix-ui/react-tooltip"
import { useActorRef } from "@xstate/react"
import React, { createContext } from "react"
import { HelmetProvider } from "react-helmet-async"
import { ParallaxProvider } from "react-scroll-parallax"

import {
  transferMachine,
  TransferMachineActor,
} from "./features/transfer-modal/machine"
import {
  validateETHAddress,
  validateBTCAddress,
} from "./features/transfer-modal/utils"

export type ViewOnlyAddressType = "icp" | "evm" | "btc" | null

function detectAddressType(address: string | null): ViewOnlyAddressType {
  if (!address) return null
  if (validateETHAddress(address) === true) return "evm"
  if (validateBTCAddress(address) === true) return "btc"
  return "icp"
}

interface ProviderProps {
  children: React.ReactNode
}

export const ProfileContext = createContext({
  transferService: {} as TransferMachineActor,
  isViewOnlyMode: false,
  viewOnlyAddress: null as string | null,
  viewOnlyAddressType: null as ViewOnlyAddressType,
})

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  const transferService: TransferMachineActor = useActorRef(transferMachine)
  const viewOnlyAddress = new URLSearchParams(window.location.search).get(
    "viewOnly",
  )
  const viewOnlyAddressType = detectAddressType(viewOnlyAddress)
  const isViewOnlyMode = Boolean(viewOnlyAddress)

  return (
    <ParallaxProvider>
      <HelmetProvider>
        <ProfileContext.Provider
          value={{
            transferService,
            isViewOnlyMode,
            viewOnlyAddress,
            viewOnlyAddressType,
          }}
        >
          <RadixTooltip.Provider>{children}</RadixTooltip.Provider>
        </ProfileContext.Provider>
      </HelmetProvider>
    </ParallaxProvider>
  )
}
