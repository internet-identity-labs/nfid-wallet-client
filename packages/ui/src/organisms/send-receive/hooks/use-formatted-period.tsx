import { useMemo } from "react"

export const useFormattedPeriod = (value?: number, fullName?: boolean) => {
  return useMemo(() => {
    if (value === undefined) return ""
    if (value === 0) return "0"

    const years = Math.floor(value / 12)
    const months = value % 12

    const yearsString =
      years > 0
        ? fullName
          ? `${years} year${years > 1 ? "s" : ""}`
          : `${years}y`
        : ""

    const monthsString =
      months > 0
        ? fullName
          ? `${months} month${months > 1 ? "s" : ""}`
          : `${months}m`
        : ""

    return [yearsString, monthsString].filter(Boolean).join(", ")
  }, [value])
}
