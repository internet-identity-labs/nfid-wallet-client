import clsx from "clsx"
import { motion } from "framer-motion"
import { HTMLAttributes } from "react"

interface ITab extends HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  onClick?: () => void
  length: number
  hasNotification?: boolean
}

const Tab: React.FC<ITab> = ({
  isActive,
  onClick,
  children,
  id,
  length,
  hasNotification,
}) => {
  const getWidth = () => {
    if (length > 0) {
      return `${(100 / length).toFixed(2)}%`
    }
    return "auto"
  }
  return (
    <div
      className={clsx(
        "py-[10px] border-b-2 mr-0.5 cursor-pointer relative transition-all",
        "flex-shrink-0 sm:min-w-[150px] sm:!w-auto border-black",
        !isActive && "hover:border-gray-500 hover:text-gray-500",
      )}
      onClick={onClick}
      style={{ width: getWidth() }}
    >
      <div
        className={clsx(
          "flex gap-[8px] items-center text-[20px] leading-[20px]",
          isActive ? "font-bold text-teal-600" : "font-semibold",
        )}
        id={`${id}`}
      >
        <div
          className={clsx(
            "relative",
            hasNotification &&
              "after:rounded-full after:my-auto after:content-[''] after:absolute after:w-2 after:h-2 after:bg-red-600 after:top-0 after:bottom-0 after:right-[-15px]",
          )}
        >
          {children}
        </div>
      </div>
      <motion.div
        className="absolute left-0 bottom-[-2px] h-[2px] bg-teal-600"
        animate={{ width: isActive ? "100%" : "0%" }}
        exit={{ scaleX: 0 }}
        transition={{ duration: 0.25 }}
      />
    </div>
  )
}

export default Tab
