import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import { PropsWithChildren } from "react"

export interface ITransferTemplate extends PropsWithChildren {
  onClickOutside?: () => void
  className?: string
  overlayClassName?: string
  isOpen: boolean
}

export const TransferTemplate: React.FC<ITransferTemplate> = ({
  children,
  onClickOutside,
  className,
  overlayClassName,
  isOpen,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={clsx(
            "transition ease-in-out delay-150 duration-300",
            "z-40 top-0 left-0 w-full h-screen",
            "fixed bg-opacity-75 bg-gray-600 flex",
            overlayClassName,
          )}
          style={{ margin: 0 }}
          onClick={onClickOutside}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div
            className={clsx(
              "rounded-[24px] shadow-lg px-5 pb-5 pt-[18px] text-black overflow-hidden",
              "z-20 bg-white relative border border-gray-100",
              "m-auto",
              "w-[340px] sm:w-[450px]",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
