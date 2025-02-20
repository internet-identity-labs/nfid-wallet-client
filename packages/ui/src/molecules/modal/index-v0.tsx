import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import { HTMLAttributes, FC } from "react"

import { useDisableScroll } from "./hooks/disable-scroll"

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  isVisible?: boolean
}

export const ModalComponent: FC<ModalProps> = ({
  children,
  className,
  isVisible,
  onClose,
  style,
}) => {
  useDisableScroll(Boolean(isVisible))

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen bg-opacity-50 bg-zinc-900/80"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <motion.div
            className={clsx(
              "rounded-[24px] min-w-min min-h-min h-min bg-white",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={style}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
