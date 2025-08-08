import clsx from "clsx"
import { motion } from "framer-motion"
import { FC } from "react"

import { NFIDTheme } from "frontend/App"
import { useDarkTheme } from "frontend/hooks"

import darkDarkIcon from "../assets/dark-dark.svg"
import darkIcon from "../assets/dark.svg"
import lightDarkIcon from "../assets/light-dark.svg"
import lightIcon from "../assets/light.svg"
import systemDarkIcon from "../assets/system-dark.svg"
import systemIcon from "../assets/system.svg"

interface ThemeToggleProps {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

export const ThemeSwitcher: FC<ThemeToggleProps> = ({
  walletTheme,
  setWalletTheme,
}) => {
  const themes = [NFIDTheme.LIGHT, NFIDTheme.DARK, NFIDTheme.SYSTEM]
  const activeIndex = themes.indexOf(walletTheme)
  const isDarkTheme = useDarkTheme()

  const getIcon = (theme: NFIDTheme) => {
    if (theme === NFIDTheme.LIGHT)
      return isDarkTheme ? lightDarkIcon : lightIcon
    if (theme === NFIDTheme.DARK) return isDarkTheme ? darkDarkIcon : darkIcon
    return isDarkTheme ? systemDarkIcon : systemIcon
  }

  return (
    <div
      className={clsx(
        "relative p-0.5 bg-gray-100 dark:bg-zinc-900 h-10 rounded-[12px]",
        "mb-2.5 text-sm font-semibold text-black dark:text-white",
      )}
    >
      <div className="grid grid-cols-3 h-full rounded-[10px] relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full w-1/3 bg-white dark:bg-darkGray rounded-[10px] z-0"
          initial={false}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {themes.map((theme) => {
          const label =
            theme === NFIDTheme.LIGHT
              ? "Light"
              : theme === NFIDTheme.DARK
              ? "Dark"
              : "System"

          return (
            <button
              key={theme}
              className={clsx(
                "z-10 relative flex items-center justify-center gap-[6px]",
                "transition-colors px-2",
              )}
              onClick={() => setWalletTheme(theme)}
            >
              <img src={getIcon(theme)} alt={`${label} theme`} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
