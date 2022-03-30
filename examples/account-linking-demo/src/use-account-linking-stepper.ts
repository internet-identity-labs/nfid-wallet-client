import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import React from "react"

interface AccountLinkingState {
  ii: { registered: boolean; userName?: string; principalId?: string }
  nfid: { registered: boolean; userName?: string; principalId?: string }
  usedProvider: "II" | "NFID" | null
}

const stepAtom = atomWithStorage<AccountLinkingState>(
  "nfid-account-linking-state",
  {
    ii: {
      registered: false,
    },
    nfid: {
      registered: false,
    },
    usedProvider: null,
  },
)

export const useAccountLinkingStepper = () => {
  const [state, setState] = useAtom(stepAtom)
  const setIIPrincipalId = React.useCallback(
    (principalId: string) => {
      setState((s) => ({ ...s, ii: { ...s.ii, principalId } }))
    },
    [setState],
  )

  const setNFIDPrincipalId = React.useCallback(
    (principalId: string) => {
      setState((s) => ({ ...s, nfid: { ...s.nfid, principalId } }))
    },
    [setState],
  )

  const setIIUserName = React.useCallback(
    (userName: string) => {
      setState((s) => ({ ...s, ii: { ...s.ii, registered: true, userName } }))
    },
    [setState],
  )

  const setNFIDUserName = React.useCallback(
    (userName: string) => {
      setState((s) => ({
        ...s,
        nfid: { ...s.nfid, registered: true, userName },
      }))
    },
    [setState],
  )

  const setProvider = React.useCallback(
    (provider: "II" | "NFID") => {
      setState((s) => ({ ...s, usedProvider: provider }))
    },
    [setState],
  )

  return {
    state,
    setProvider,
    setIIPrincipalId,
    setNFIDPrincipalId,
    setIIUserName,
    setNFIDUserName,
  }
}
