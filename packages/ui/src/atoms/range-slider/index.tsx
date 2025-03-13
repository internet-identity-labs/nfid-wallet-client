import * as Slider from "@radix-ui/react-slider"
import clsx from "clsx"

import "./index.css"

export interface RangeSliderProps {
  value: number
  setValue?: (value: number) => void
  min: number
  max: number
  step: number
  disabled?: boolean
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value,
  setValue,
  min,
  max,
  step,
  disabled,
}) => {
  return (
    <div className="relative w-full">
      <Slider.Root
        className="relative flex items-center w-full h-6 select-none touch-none"
        step={step}
        min={min}
        max={max}
        minStepsBetweenThumbs={2}
        value={[value]}
        onValueChange={(v) => setValue && setValue(v[0])}
        disabled={disabled}
      >
        <Slider.Track className="SliderTrack">
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <div
          className={clsx(
            "absolute w-full h-2 gap-1 px-[1px]",
            "flex items-center justify-between",
          )}
        >
          {Array(max === 1 ? 1 : max - 1)
            .fill(null)
            .map((_, i) => (
              <div
                key={`range_slider_section_${i}`}
                className={clsx(
                  "block w-full h-2 bg-gray-200 dark:bg-zinc-500",
                  (i < value - 1 || max === 1) && "!bg-teal-600",
                  i + 2 === max && "rounded-r-full",
                  i === 0 && "rounded-l-full",
                  i === 0 && max === 1 && "rounded-full",
                )}
              />
            ))}
        </div>
        {!disabled && <Slider.Thumb className="SliderThumb" id="slider" />}
      </Slider.Root>
      <div
        className={clsx(
          "flex items-center justify-between mt-[15px] text-xs text-gray-400 dark:text-zinc-500",
        )}
      >
        {Array(max === 2 ? 2 : max === 1 ? 0 : max)
          .fill(null)
          .map((_, i) => (
            <p
              key={`range_slider_number_${i}`}
              className={clsx(
                i + 1 === value && "font-bold text-black dark:text-white",
              )}
            >
              {i + 1}
            </p>
          ))}
      </div>
    </div>
  )
}
