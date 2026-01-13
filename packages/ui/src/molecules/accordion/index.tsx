import * as Accordion from "@radix-ui/react-accordion"
import { useState } from "react"

interface IAccordionV2 {
  trigger: JSX.Element
  children: JSX.Element
  className?: string
}

export const AccordionV2 = ({ trigger, children, className }: IAccordionV2) => {
  const [isOpen, setIsOpen] = useState("")

  return (
    <Accordion.Root type="single" value={isOpen ? "1" : ""}>
      <Accordion.Item value="1" className={className}>
        <Accordion.Trigger
          onClick={() => setIsOpen(isOpen === "1" ? "" : "1")}
          className="w-full"
        >
          {trigger}
        </Accordion.Trigger>
        <Accordion.Content className="w-full">{children}</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
