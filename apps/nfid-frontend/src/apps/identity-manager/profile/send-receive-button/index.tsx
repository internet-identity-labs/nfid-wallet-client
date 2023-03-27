import clsx from "clsx"
import { useAtom } from "jotai"

import { transferModalAtom } from "@nfid-frontend/ui"
import { Image } from "@nfid-frontend/ui"

import { Button } from "frontend/ui/atoms/button"

import SendReceiveIcon from "./send_receive.svg"

export const SendReceiveButton = () => {
  const [transferModalState, setTransferModalState] = useAtom(transferModalAtom)

  return (
    <div id="sendReceiveButton">
      <Button
        className={clsx(
          "px-[10px] py-[11px] space-x-2.5 items-center",
          "hidden md:flex z-10",
        )}
        id="sendReceiveButton"
        onClick={() =>
          setTransferModalState({ ...transferModalState, isModalOpen: true })
        }
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
        onClick={() =>
          setTransferModalState({ ...transferModalState, isModalOpen: true })
        }
      >
        <Image className="w-6 h-6" src={SendReceiveIcon} alt="transaction" />
      </div>
    </div>
  )
}
