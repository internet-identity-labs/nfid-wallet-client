import clsx from "clsx"
import { forwardRef, InputHTMLAttributes, useMemo } from "react"
import { NumericFormat } from "react-number-format"

import { Skeleton } from "../../atoms/skeleton"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  decimals: number
  isLoading: boolean
  value: string
  fontSize?: number
  className?: string
}

export const InputAmount = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      fontSize,
      className,
      id,
      decimals,
      disabled,
      isLoading = false,
      value,
      name,
      onChange,
      onBlur,
      onKeyDown,
    },
    ref,
  ) => {
    const inputFontSize = useMemo(() => {
      if (fontSize) return fontSize
      if (!value) return 34
      if (value.length > 16) {
        return 16
      } else if (value.length > 10) {
        return 20
      } else {
        return 34
      }
    }, [value])

    const handlePaste = (e: any) => {
      const data = e.clipboardData
      if (!data) return
      const pastedText = e.clipboardData.getData("Text")
      if (pastedText.includes(",")) {
        e.preventDefault()
        const adjustedValue = pastedText.replace(",", ".")
        ;(e.target as HTMLInputElement).setRangeText(adjustedValue)
      }
    }

    return (
      <>
        {isLoading ? (
          <Skeleton className="!w-[124px] rounded-[6px]" />
        ) : (
          <NumericFormat
            placeholder="0.00"
            decimalScale={decimals}
            allowedDecimalSeparators={[",", "."]}
            min={0.0}
            onPaste={handlePaste}
            decimalSeparator="."
            getInputRef={ref}
            value={value}
            onChange={(e) => onChange?.(e)}
            onBlur={(e) => onBlur?.(e)}
            onKeyDown={(e) => onKeyDown?.(e)}
            disabled={disabled}
            id={id}
            className={clsx(
              "min-w-0 font-semibold leading-10 bg-transparent",
              "outline-none border-none focus:ring-0 p-0 max-w-[100px] sm:max-w-[190px]",
              disabled
                ? "text-gray-500 placeholder:text-gray-500"
                : "text-black placeholder:text-black",
              className,
            )}
            name={name}
            style={{ fontSize: inputFontSize }}
          />
        )}
      </>
    )
  },
)
