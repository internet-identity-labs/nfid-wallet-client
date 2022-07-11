import { useAtom } from "jotai"
import React from "react"

import { NFIDLogin } from "frontend/ui/pages/nfid-login"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export const Authenticate: React.FC<{ machine: any }> = ({ machine }) => {
  const [, send] = useAtom(machine)

  return (
    <ScreenResponsive className="flex flex-col items-center">
      <NFIDLogin onLogin={() => send("AUTHENTICATED")} />
    </ScreenResponsive>
  )
}
