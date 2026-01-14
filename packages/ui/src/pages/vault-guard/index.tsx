import React, { PropsWithChildren } from "react"

import { Loader } from "@nfid-frontend/ui"

import { NotFound } from "../404"

interface VaultGuardProps extends PropsWithChildren {
  vaults: any[] | null | undefined
  isLoading: boolean
}

export const VaultGuard = ({
  children,
  vaults,
  isLoading,
}: VaultGuardProps) => {
  if (!vaults || isLoading) return <Loader isLoading={true} />

  if (vaults && !vaults?.length) return <NotFound />

  return <>{children}</>
}
