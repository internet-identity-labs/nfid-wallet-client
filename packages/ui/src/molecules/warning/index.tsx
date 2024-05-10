import clsx from "clsx"

import { IconCmpWarning } from "@nfid-frontend/ui"

export interface IWarning {
  title: string
  text: string
  link?: {
    text: string
    url: string
  }
}

export const Warning = ({ title, text, link }: IWarning) => (
  <div className="w-full p-4 my-3 rounded-md bg-orange-50">
    <div className={clsx("flex items-center justify-between")}>
      <div className="flex items-center text-sm font-bold">
        <IconCmpWarning className="text-orange w-[22px] mr-2.5" />
        <p className="text-orange-900 text-sm font-bold">{title}</p>
      </div>
    </div>
    <div className="pl-8 space-y-3 text-sm">
      <div>
        <p className="text-orange-900 text-sm">
          {link && (
            <a className="text-blue-600" href={link.url} target="_blank">
              {link.text}&nbsp;
            </a>
          )}
          {text}
        </p>
      </div>
    </div>
  </div>
)
