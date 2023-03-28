import { useActor } from "@xstate/react"
import clsx from "clsx"
import { useContext } from "react"

import { Image } from "@nfid-frontend/ui"

import { ProfileContext } from "frontend/App"
import { TransferMachineActor } from "frontend/features/transfer-modal/machine"
import { Button } from "frontend/ui/atoms/button"

import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const globalServices = useContext(ProfileContext)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, send] = useActor(
    (globalServices as { transferService: TransferMachineActor })
      .transferService,
  )
  return (
    <div id="sendReceiveButton">
      <Button
        className={clsx(
          "px-[10px] py-[11px] space-x-2.5 items-center",
          "hidden md:flex z-10",
        )}
        id="sendReceiveButton"
        onClick={() => send("SHOW")}
        primary
      >
        <Image src={SendReceiveIcon} alt="send/receive" />
        <span>Send / Receive</span>
      </Button>
      <div
        className={clsx(
          "md:hidden fixed bottom-3 right-3 w-12 h-12",
          "bg-blue-600 flex items-center justify-center",
          "rounded-full shadow-blueLight shadow-blue-600",
          "cursor-pointer z-30",
        )}
        onClick={() => send("SHOW")}
      >
        <Image className="w-6 h-6" src={SendReceiveIcon} alt="transaction" />
      </div>
    </div>
  )
}
