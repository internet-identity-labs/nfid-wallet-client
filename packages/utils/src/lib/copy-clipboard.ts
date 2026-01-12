export const copyToClipboard = (
  e: { stopPropagation: () => void },
  value?: string,
  callback?: () => void,
) => {
  e.stopPropagation()
  navigator.clipboard.writeText(value ?? "")
  callback?.()
}
