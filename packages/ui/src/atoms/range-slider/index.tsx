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
        minStepsBetweenThumbs={1}
        value={[value]}
        onValueChange={(v) => setValue && setValue(v[0])}
        disabled={disabled}
      >
        <Slider.Track className="SliderTrack">
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <div
          className={clsx(
            "absolute w-full h-2 px-[1px] rounded-full",
            "flex items-center justify-between overflow-hidden",
            value === max && "bg-gradient-to-r from-teal-600 to-[#00FFE5]",
          )}
        >
          {Array(max)
            .fill(null)
            .map((_, i) => (
              <div
                key={`range_slider_section_${i}`}
                className={clsx(
                  "block w-full h-2 bg-gray-200",
                  i < value - 2 && "!bg-teal-600",
                  i < value - 2 && value === max && "!bg-transparent",
                )}
              />
            ))}
        </div>
        {!disabled && (
          <Slider.Thumb
            className={clsx("SliderThumb", value === max && "!bg-teal-400")}
            id="slider"
          />
        )}
      </Slider.Root>
      <div
        className={clsx(
          "flex items-center justify-between mt-[1px] text-xs text-gray-500 leading-[25px]",
        )}
      >
        <p>{min / 12}y</p>
        <p>{max / 12}y</p>
      </div>
    </div>
  )
}
