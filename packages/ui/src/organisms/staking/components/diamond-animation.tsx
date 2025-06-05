import clsx from "clsx"
import { motion } from "framer-motion"
import { FC } from "react"

import DiamondIcon from "../../staking/assets/diamond.svg"

interface DiamondAnimationProps {
  classname?: string
  isActive: boolean
}

export const DiamondAnimation: FC<DiamondAnimationProps> = ({
  classname,
  isActive,
}) => {
  const diamonds = Array.from({ length: 20 })

  return (
    <div className={clsx("absolute w-[15px] h-[15px]", classname)}>
      {isActive &&
        diamonds.map((_, i) => {
          const x = (Math.random() - 0.5) * 500
          const y = (Math.random() - 0.5) * 500
          const rotation = Math.random() * 360

          return (
            <motion.img
              className={clsx(
                "absolute top-1/2 left-1/2 w-[15px] h-[15px]",
                "-translate-x-1/2 -translate-y-1/2 pointer-events-none",
              )}
              key={`diamond_${i}`}
              src={DiamondIcon}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x, y, opacity: 0, rotate: rotation }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          )
        })}
    </div>
  )
}
