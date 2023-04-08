import clsx from "clsx"
import React, { useRef, useState } from "react"

export interface AccordionProps {
  title: React.ReactNode
  details: React.ReactNode
  isBorder?: boolean
  style?: any
  openTrigger?: string
  closeTrigger?: string
  className?: string
  detailsClassName?: string
  titleClassName?: string
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  details,
  className,
  isBorder = true,
  style,
  detailsClassName,
  openTrigger,
  closeTrigger,
  titleClassName,
}) => {
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState("0px")
  const [rotate, setRotate] = useState("transform duration-700 ease")

  const contentSpace = useRef<HTMLDivElement>(null)

  function toggleAccordion() {
    setActive((prevState) => !prevState)
  }

  React.useEffect(() => {
    setHeight(
      active
        ? `${contentSpace.current && contentSpace.current.scrollHeight}px`
        : "0px",
    )
    setRotate(
      active
        ? "transform duration-700 ease rotate-180"
        : "transform duration-700 ease",
    )
  }, [active])

  React.useEffect(() => {
    if (openTrigger) {
      setActive(true)
    }
  }, [openTrigger])

  React.useEffect(() => {
    if (closeTrigger) {
      setActive(false)
    }
  }, [closeTrigger])

  return (
    <div
      className={clsx(
        "flex flex-col border-gray-200 font-inter",
        isBorder && "border-b",
      )}
    >
      <button
        className={clsx(
          "flex items-center justify-between py-6",
          "box-border appearance-none cursor-pointer focus:outline-none",
          className,
        )}
        style={style}
        onClick={toggleAccordion}
      >
        <div
          className={clsx(
            "block text-lg font-bold text-left sm:text-xl w-[100%]",
            titleClassName,
          )}
        >
          {title}
        </div>
        <div className={`${rotate} inline-block w-[30px] h-[30px]`}>
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.34564 12L15 18.6543L21.6543 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      <div
        ref={contentSpace}
        style={{ maxHeight: `${height}` }}
        className="overflow-hidden duration-700 ease-in-out transition-max-height"
      >
        <div
          className={clsx(
            "pb-10 text-base sm:text-lg tracking-[0.01em] leading-[26px]",
            detailsClassName,
          )}
        >
          {details}
        </div>
      </div>
    </div>
  )
}
