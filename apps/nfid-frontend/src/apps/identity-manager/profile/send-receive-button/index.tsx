import { useActor } from "@xstate/react"
import clsx from "clsx"
import { useContext } from "react"

import { Button } from "@nfid-frontend/ui"
import { sendReceiveTracking } from "@nfid/integration"

import { ProfileContext } from "frontend/provider"

import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const globalServices = useContext(ProfileContext)

  const [, send] = useActor(globalServices.transferService)

  const handleOpenSendReceive = () => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send("SHOW")
  }
  return (
    <div id="sendReceiveButton">
      <Button
        className={clsx("px-[10px] hidden md:flex z-10")}
        id="sendReceiveButton"
        onClick={handleOpenSendReceive}
        icon={<img src={SendReceiveIcon} alt="send/receive" />}
        isSmall
      >
        Send / Receive
      </Button>
      <div
        className={clsx(
          "md:hidden fixed bottom-3 right-3 w-12 h-12",
          "bg-primaryButtonColor flex items-center justify-center",
          "rounded-full shadow-blueLight shadow-primaryButtonColor",
          "cursor-pointer z-30",
        )}
        onClick={handleOpenSendReceive}
        id="sendReceiveButton"
      >
        <img className="w-6 h-6" src={SendReceiveIcon} alt="transaction" />
      </div>
    </div>
  )
}
