import { Button } from "@nfid/ui/molecules/button"
import { FC } from "react"

import WarningIcon from "../assets/swap-warning.svg"

export interface ErrorModalProps {
  refresh: () => void
}

export const ErrorModal: FC<ErrorModalProps> = ({ refresh }) => {
  return (
    <div
      className="absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full p-5 bg-white/60"
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="text-center max-w-[320px] mb-[50px]">
        <img
          className="w-[33px] mx-auto"
          src={WarningIcon}
          alt="NFID Warning"
        />
        <p className="my-4 font-bold leading-6 text-[20px]">
          Service temporarily unavailable
        </p>
        <p className="text-sm leading-5">
          Swapping is temporarily unavailable. Please try again later.{" "}
        </p>
      </div>
      <Button
        className="absolute bottom-5 left-5 right-5 !w-auto"
        type="stroke"
        onClick={refresh}
      >
        Refresh
      </Button>
    </div>
  )
}
