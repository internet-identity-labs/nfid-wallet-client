import React, { useRef, useState } from "react"

export interface AccordionProps {
  title: React.ReactNode
  details: React.ReactNode
}

export const Accordion: React.FC<AccordionProps> = ({ title, details }) => {
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState("0px")
  const [rotate, setRotate] = useState("transform duration-700 ease")

  const contentSpace = useRef<HTMLDivElement>(null)

  function toggleAccordion() {
    setActive((prevState) => !prevState)
    setHeight(
      active
        ? "0px"
        : `${contentSpace.current && contentSpace.current.scrollHeight}px`,
    )
    setRotate(
      active
        ? "transform duration-700 ease"
        : "transform duration-700 ease rotate-180",
    )
  }

  return (
    <div className="flex flex-col border-b border-gray-200 font-inter">
      <button
        className="box-border flex items-center justify-between py-6 appearance-none cursor-pointer focus:outline-none"
        onClick={toggleAccordion}
      >
        <p className="inline-block text-lg font-bold text-left sm:text-xl">
          {title}
        </p>
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
              stroke="black"
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
        <div className="pb-10 text-base sm:text-lg tracking-[0.01em] leading-[26px]">
          {details}
        </div>
      </div>
    </div>
  )
}
