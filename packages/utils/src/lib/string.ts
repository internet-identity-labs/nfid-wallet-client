export const truncateString = (
  str: string,
  leadingChars: number,
  trailingChars?: number,
): string => {
  if (str.length < leadingChars) return str
  if (trailingChars) {
    const splitAt = str.length - trailingChars
    return `${str.slice(0, leadingChars)}...${str.slice(splitAt)}`
  }

  return `${str.slice(0, leadingChars)}...`
}

export const copyToClipboard = (
  e: { stopPropagation: () => void },
  value?: string,
  callback?: () => void,
) => {
  e.stopPropagation()
  navigator.clipboard.writeText(value ?? "")
  callback && callback()
}
