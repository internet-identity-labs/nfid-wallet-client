import React from "react"

interface PageWrapperProps {}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => (
  <div className="sticky top-0 z-40 flex-none w-full transition-colors duration-500 backdrop-blur lg:z-50 lg:border-b lg:border-slate-900/10 bg-white/95 supports-backdrop-blur:bg-white/60 ">
    <div className="mx-auto max-w-7xl">{children}</div>
  </div>
)
