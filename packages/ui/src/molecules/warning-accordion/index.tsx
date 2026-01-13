import clsx from "clsx"

import { AccordionV2, IconCmpArrowRight, IconCmpWarning } from "@nfid/ui"

export interface IWarningAccordionOption {
  title: string
  subtitle: string | JSX.Element
}

export interface IWarningAccordion {
  warnings?: IWarningAccordionOption[]
}

export const WarningAccordion = ({ warnings }: IWarningAccordion) => {
  if (!warnings?.length) return null

  return (
    <AccordionV2
      className="w-full p-4 my-3 rounded-md bg-orange-50"
      trigger={
        <div className={clsx("flex items-center justify-between")}>
          <div className="flex items-center text-sm font-bold">
            <IconCmpWarning className="text-orange w-[22px] mr-2.5" />
            <p>Attention required</p>
          </div>
          <div>
            <IconCmpArrowRight className="rotate-90" />
          </div>
        </div>
      }
    >
      <div className="px-8 pt-3 space-y-3 text-sm">
        {warnings.map((item, i) => {
          return (
            <div key={`item_${item.title}_${i}`}>
              <p className="font-bold">{item.title}</p>
              <p>{item.subtitle}</p>
            </div>
          )
        })}
      </div>
    </AccordionV2>
  )
}
