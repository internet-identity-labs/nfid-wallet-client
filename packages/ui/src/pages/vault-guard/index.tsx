import React, { PropsWithChildren } from "react"

import { Loader } from "@nfid/ui"
import { useSWR } from "@nfid/swr"

import { useVaultMember } from "frontend/features/vaults/hooks/use-vault-member"
import { getAllVaults } from "frontend/features/vaults/services"

import { NotFound } from "../404"

export const VaultGuard = ({ children }: PropsWithChildren) => {
  const { isReady } = useVaultMember()
  const { data: vaults, isLoading } = useSWR(
    [isReady ? "vaults" : null],
    getAllVaults,
  )

  if (!vaults || isLoading) return <Loader isLoading={true} />

  if (vaults && !vaults?.length) return <NotFound />

  return <>{children}</>
}
