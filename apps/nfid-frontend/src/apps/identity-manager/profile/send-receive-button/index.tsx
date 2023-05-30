import { useActor } from "@xstate/react"
import clsx from "clsx"
import { useContext } from "react"

import { Button, Image } from "@nfid-frontend/ui"

import { ProfileContext } from "frontend/provider"

import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const globalServices = useContext(ProfileContext)

  const [, send] = useActor(globalServices.transferService)
  return (
    <div id="sendReceiveButton">
      <Button
        className={clsx("px-[10px] py-[11px] hidden md:flex z-10")}
        id="sendReceiveButton"
        onClick={() => send("SHOW")}
        icon={<Image src={SendReceiveIcon} alt="send/receive" />}
      >
        Send / Receive
      </Button>
      <div
        className={clsx(
          "md:hidden fixed bottom-3 right-3 w-12 h-12",
          "bg-blue-600 flex items-center justify-center",
          "rounded-full shadow-blueLight shadow-blue-600",
          "cursor-pointer z-30",
        )}
        onClick={() => send("SHOW")}
        id="sendReceiveButton"
      >
        <Image className="w-6 h-6" src={SendReceiveIcon} alt="transaction" />
      </div>
    </div>
  )
}
