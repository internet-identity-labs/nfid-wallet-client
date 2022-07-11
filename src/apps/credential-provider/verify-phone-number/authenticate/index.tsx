import { useAtom } from "jotai"
import React from "react"

import { NFIDLogin } from "frontend/design-system/pages/nfid-login"
import { ScreenResponsive } from "frontend/design-system/templates/screen-responsive"

export const Authenticate: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)

  return (
    <ScreenResponsive className="flex flex-col items-center">
      <NFIDLogin onLoginSuccess={() => send("AUTHENTICATED")} />
    </ScreenResponsive>
  )
}
