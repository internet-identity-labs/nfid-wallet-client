 
import { FC, useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "@nfid-frontend/ui"
import { Button } from "@nfid-frontend/ui"

import { Spinner } from "packages/ui/src/atoms/spinner"
import { PurgeModalProps } from "../types"

import toaster from "packages/ui/src/atoms/toast"

const DEFAULT_ERROR = "Something went wrong. Please try again later"

export const PurgeModal: FC<PurgeModalProps> = ({ isOpen, onClose, purge }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurge = async () => {
    try {
      setIsLoading(true)
      await purge()
      onClose()
    } catch (e) {
      console.error("Purge error", (e as Error).message)
      toaster.error(DEFAULT_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={onClose}
      className={clsx(
        "p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-1 overflow-auto",
        "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 snap-end font-inter",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-darkGray",
      )}
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5">
        Clear queue
      </p>
      <p className="text-sm leading-5 dark:text-white">
        Upon approval, this will cancel all transactions in your queue.
        <br />
        Are you sure you want to clear your queue?
      </p>
      <div className="mt-5 flex justify-end gap-2.5 h-10">
        <Button
          type="stroke"
          isSmall
          className="w-full sm:w-[120px] h-full"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          isSmall
          className="w-full sm:w-[140px] h-full"
          type="red"
          onClick={handlePurge}
          disabled={isLoading}
          iconEnd={isLoading ? <Spinner /> : null}
        >
          Clear queue
        </Button>
      </div>
    </ModalComponent>
  )
}
