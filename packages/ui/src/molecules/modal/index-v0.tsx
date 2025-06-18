import clsx from "clsx"
import { motion } from "framer-motion"
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
    <>
      {isVisible && (
        <motion.div
          key={isVisible ? "visible" : "hidden"}
          className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-screen bg-opacity-80 bg-[#18181B]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div
            className={clsx(
              "rounded-[24px] min-w-min min-h-min h-min bg-white",
              className,
            )}
            onClick={(e) => e.stopPropagation()}
            style={style}
          >
            {children}
          </div>
        </motion.div>
      )}
    </>
  )
}
