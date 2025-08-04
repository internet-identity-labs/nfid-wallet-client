import clsx from "clsx"
import { ReactNode } from "react"

import { IconCmpWarning } from "@nfid-frontend/ui"

export enum CardType {
  WARNING,
  NOTICE,
}

export interface ICard {
  title?: string
  text: string | ReactNode
  link?: {
    text: string
    url: string
  }
  classNames?: string
  hasIcon?: boolean
  green?: boolean
  type?: CardType
}

export const Card = ({
  title,
  text,
  link,
  classNames,
  hasIcon = true,
  type = CardType.WARNING,
}: ICard) => (
  <div
    className={clsx(
      type === CardType.WARNING && "bg-orange-50 dark:bg-orange-500/10",
      type === CardType.NOTICE && "bg-green-50",
      "w-full p-[15px] my-3 rounded-[12px]",
      classNames,
    )}
  >
    {title && (
      <div className={clsx("flex items-center justify-between")}>
        <div className="flex items-center text-sm font-bold">
          {hasIcon && (
            <IconCmpWarning
              className={clsx(
                type === CardType.WARNING &&
                  "text-orange-900 dark:text-amber-600",
                type === CardType.NOTICE && "text-green-900",
                "w-[22px] mr-2.5",
              )}
            />
          )}

          <p
            className={clsx(
              type === CardType.WARNING &&
                "text-orange-900 dark:text-amber-600",
              type === CardType.NOTICE && "text-green-900",
              "text-sm font-bold",
            )}
          >
            {title}
          </p>
        </div>
      </div>
    )}
    <div className={clsx("space-y-3 text-sm", title && "pl-8")}>
      <div>
        <div className="flex gap-[10px]">
          {!title && hasIcon && (
            <IconCmpWarning
              className={clsx(
                type === CardType.WARNING &&
                  "text-orange-900 dark:text-amber-600",
                type === CardType.NOTICE && "text-green-900",
                "h-[22px] w-[22px] shrink-0",
              )}
            />
          )}
          <p
            className={clsx(
              type === CardType.WARNING &&
                "text-orange-900 dark:text-amber-600",
              type === CardType.NOTICE && "text-green-900",
              "text-sm",
              classNames,
            )}
          >
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
