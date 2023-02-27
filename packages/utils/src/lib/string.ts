import * as React from "react"

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "..."
  }
  return str
}

export const copyToClipboard = (
  e: React.MouseEvent<HTMLElement | SVGSVGElement, MouseEvent>,
  value?: string,
  callback?: () => void,
) => {
  e.stopPropagation()
  navigator.clipboard.writeText(value ?? "")
  callback && callback()
}
