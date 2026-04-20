/**
 * nfid-demo only: resolves `frontend/hooks` without loading `apps/nfid-frontend/src/hooks/index.ts`,
 * which re-exports profile/contexts and pulls most of the wallet app into ForkTsChecker + webpack.
 * Keep in sync with `apps/nfid-frontend/src/hooks/dark-theme.ts`.
 */
import { useEffect, useState } from "react"

export const useDarkTheme = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}
