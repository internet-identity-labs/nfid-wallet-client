import React from "react"

interface PageWrapperProps {}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => (
  <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
    <div className="mx-auto max-w-7xl">{children}</div>
  </div>
)
