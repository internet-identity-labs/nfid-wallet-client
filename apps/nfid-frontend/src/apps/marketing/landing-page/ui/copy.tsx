import { PropsWithChildren, useState } from "react"

export function Copy({
  children,
  onCopied,
  onCopiedTimeout,
  value,
}: PropsWithChildren<{
  onCopied?: () => unknown
  onCopiedTimeout?: () => unknown
  value: string
}>) {
  const [clicked, setClicked] = useState(false)
  return (
    <div
      onClick={() => {
        if (clicked) return
        setClicked(true)
        setTimeout(() => {
          setClicked(false)
          onCopiedTimeout?.()
        }, 1000)
        navigator.clipboard.writeText(value)
        onCopied?.()
      }}
    >
      {children}
    </div>
  )
}
