import * as Slider from "@radix-ui/react-slider"
import clsx from "clsx"

import { getFormattedPeriod } from "../../organisms/send-receive/utils"
import "./index.css"

export interface RangeSliderProps {
  value?: number
  setValue?: (value: number) => void
  min: number
  max: number
  step: number
  disabled?: boolean
  showMarks?: boolean
  segmentGap?: number
  highlightedSegments?: number[]
  className?: string
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  setValue,
  min,
  max,
  step,
  disabled,
  showMarks,
  segmentGap,
  highlightedSegments,
  className,
}) => {
  const safeValue = value ?? min

  const handleValueChange = (v: number[]) => {
    if (setValue) {
      setValue(Math.min(Math.max(v[0], min), max))
    }
  }

  return (
    <div className="relative w-full">
      <Slider.Root
        className="relative flex items-center w-full h-6 select-none touch-none"
        step={step}
        min={min}
        max={max}
        value={[safeValue]}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <Slider.Track className="SliderTrack">
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <div
          className={clsx(
            "absolute w-full h-2 px-[1px] rounded-full",
            "flex items-center justify-between overflow-hidden",
            safeValue === max &&
              segmentGap === undefined &&
              "bg-gradient-to-r from-teal-600 to-[#00FFE5]",
            className,
          )}
          style={segmentGap ? { gap: segmentGap } : undefined}
        >
          {Array.from({ length: Math.max(1, (max - min) / step) }).map(
            (_, i) => {
              const isFilled = i < Math.round((safeValue - min) / step)
              const segmentValue = min + i * step
              const isHighlighted =
                !isFilled && highlightedSegments?.includes(segmentValue)
              return (
                <div
                  key={`range_slider_section_${i}`}
                  className={clsx(
                    "block w-full h-2 bg-gray-200 dark:bg-zinc-500",
                    isFilled && "!bg-teal-600 dark:!bg-[#0D9488]",
                    isHighlighted && "!bg-orange-600",
                  )}
                />
              )
            },
          )}
        </div>
        {!disabled && (
          <Slider.Thumb
            className={clsx("SliderThumb", safeValue === max && "!bg-teal-400")}
            aria-label="Slider thumb"
            id="slider"
          />
        )}
      </Slider.Root>
      <div
        className={clsx(
          "flex items-center justify-between text-xs text-gray-500 leading-[25px]",
          showMarks ? "mt-[15px]" : "mt-[1px]",
        )}
      >
        {showMarks
          ? Array.from(
              { length: Math.floor((max - min) / step) + 1 },
              (_, i) => min + i * step,
            ).map((v) => (
              <p
                className={clsx(
                  v === safeValue
                    ? "text-black dark:text-white font-bold"
                    : "text-gray-400 dark:text-zinc-500",
                )}
                key={v}
              >
                {v}
              </p>
            ))
          : [
              <p key="min">{getFormattedPeriod(min)}</p>,
              <p key="max">{getFormattedPeriod(max)}</p>,
            ]}
      </div>
    </div>
  )
}
