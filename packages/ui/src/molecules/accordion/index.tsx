import * as RadixAccordion from "@radix-ui/react-accordion"
import clsx from "clsx"
import React, { useRef, useState, useEffect } from "react"

export interface AccordionProps {
  title?: React.ReactNode
  details?: React.ReactNode
  isBorder?: boolean
  style?: React.CSSProperties
  openTrigger?: string
  closeTrigger?: string
  className?: string
  detailsClassName?: string
  titleClassName?: string
  isOpen?: boolean
  trigger?: JSX.Element
  children?: JSX.Element | React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  type?: "single" | "multiple"
  collapsible?: boolean
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  details,
  isBorder = true,
  style,
  openTrigger,
  closeTrigger,
  className,
  detailsClassName,
  titleClassName,
  isOpen,
  trigger,
  children,
  value: controlledValue,
  onValueChange,
  type = "single",
  collapsible = true,
}) => {
  // All hooks must be called unconditionally at the top
  const [internalValueMultiple, setInternalValueMultiple] = useState<string[]>(
    Array.isArray(controlledValue)
      ? controlledValue
      : controlledValue
        ? [controlledValue]
        : [],
  )
  const [internalValueSingle, setInternalValueSingle] = useState(
    controlledValue ?? "",
  )
  const [active, setActive] = useState(isOpen ?? false)
  const [height, setHeight] = useState("0px")
  const [rotate, setRotate] = useState("transform duration-700 ease")
  const contentSpace = useRef<HTMLDivElement>(null)

  // Effects for non-trigger mode
  useEffect(() => {
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

  useEffect(() => {
    if (openTrigger) {
      setActive(true)
    }
  }, [openTrigger])

  useEffect(() => {
    if (closeTrigger) {
      setActive(false)
    }
  }, [closeTrigger])

  useEffect(() => {
    if (isOpen !== undefined) {
      setActive(isOpen)
    }
  }, [isOpen])

  if (trigger !== undefined) {
    if (type === "multiple") {
      const value = controlledValue
        ? Array.isArray(controlledValue)
          ? controlledValue
          : [controlledValue]
        : internalValueMultiple
      const handleValueChange = onValueChange
        ? (vals: string[]) => onValueChange(vals.join(","))
        : setInternalValueMultiple

      return (
        <RadixAccordion.Root
          type="multiple"
          value={value}
          onValueChange={handleValueChange}
        >
          <RadixAccordion.Item value="1" className={className}>
            <RadixAccordion.Trigger className="w-full">
              {trigger}
            </RadixAccordion.Trigger>
            <RadixAccordion.Content className="w-full">
              {children}
            </RadixAccordion.Content>
          </RadixAccordion.Item>
        </RadixAccordion.Root>
      )
    }

    // Single type (default)
    const value = controlledValue ?? internalValueSingle
    const handleValueChange = onValueChange ?? setInternalValueSingle

    return (
      <RadixAccordion.Root
        type="single"
        value={value}
        onValueChange={handleValueChange}
        collapsible={collapsible}
      >
        <RadixAccordion.Item value="1" className={className}>
          <RadixAccordion.Trigger
            onClick={() => {
              if (!onValueChange) {
                setInternalValueSingle(value === "1" ? "" : "1")
              }
            }}
            className="w-full"
          >
            {trigger}
          </RadixAccordion.Trigger>
          <RadixAccordion.Content className="w-full">
            {children}
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      </RadixAccordion.Root>
    )
  }

  function toggleAccordion() {
    setActive((prevState) => !prevState)
  }

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
          {details || children}
        </div>
      </div>
    </div>
  )
}

export const AccordionV2: React.FC<{
  trigger: JSX.Element
  children: JSX.Element
  className?: string
}> = ({ trigger, children, className }) => {
  return (
    <Accordion trigger={trigger} className={className}>
      {children}
    </Accordion>
  )
}
