import clsx from "clsx"
import { ReactNode } from "react"

import { IconCmpWarning } from "@nfid-frontend/ui"

export interface IWarning {
  title?: string
  text: string | ReactNode
  link?: {
    text: string
    url: string
  }
}

export const Warning = ({ title, text, link }: IWarning) => (
  <div className="w-full p-[15px] my-3 rounded-md bg-orange-50">
    {title && (
      <div className={clsx("flex items-center justify-between")}>
        <div className="flex items-center text-sm font-bold">
          <IconCmpWarning className="text-orange-900 w-[22px] mr-2.5" />
          <p className="text-sm font-bold text-orange-900">{title}</p>
        </div>
      </div>
    )}
    <div className={clsx("space-y-3 text-sm", title && "pl-8")}>
      <div>
        <div className="flex gap-[10px]">
          {!title && (
            <IconCmpWarning className="text-orange-900 h-[22px] w-[22px] shrink-0" />
          )}
          <p className="text-sm text-orange-900">
            {link && (
              <a
                className="text-primaryButtonColor"
                href={link.url}
                target="_blank"
              >
                {link.text}&nbsp;
              </a>
            )}
            {text}
          </p>
        </div>
      </div>
    </div>
  </div>
)
