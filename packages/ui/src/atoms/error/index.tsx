import clsx from "clsx"
import React from "react"

export default function ErrorDisplay(props: { children: React.ReactNode }) {
  return (
    <div className={clsx("py-1 text-sm text-red-base")}>{props.children}</div>
  )
}

export { ErrorDisplay }
