import React from "react"

export interface IAuthContext {
  isIframeMode: boolean
  setIsIframeMode: React.Dispatch<React.SetStateAction<boolean>>
  isIframeOpened: boolean
  setIsIframeOpened: React.Dispatch<React.SetStateAction<boolean>>
  activeProvider: "II" | "NFID" | null
  setActiveProvider: React.Dispatch<React.SetStateAction<"II" | "NFID" | null>>
}

export const AuthContext = React.createContext<IAuthContext>({
  isIframeMode: false,
  setIsIframeMode: () => {},
  isIframeOpened: false,
  setIsIframeOpened: () => {},
  activeProvider: null,
  setActiveProvider: () => {},
})
