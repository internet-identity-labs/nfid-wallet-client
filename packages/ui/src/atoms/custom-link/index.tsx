import clsx from "clsx"
import { MouseEventHandler } from "react"

import { IconCmpExternalIcon } from "../icons"

export interface CustomLinkProps {
  link?: string
  text: string
  id?: string
  classNames?: string
  withIcon?: boolean
  rel?: string
  isExternal?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export const CustomLink = ({
  link,
  text,
  id,
  classNames,
  withIcon,
  rel,
  isExternal,
  onClick,
}: CustomLinkProps) => {
  return (
    <a
      href={link}
      target={isExternal ? "_blank" : "_self"}
      className={clsx(
        "text-primaryButtonColor cursor-pointer",
        "hover:underline hover:text-teal-600 transition duration-300 ease-in-out",
        withIcon && "flex items-center gap-2",
        classNames,
      )}
      onClick={(e) => {
        if (!onClick) return
        e.preventDefault()
        onClick(e)
      }}
      id={id}
      rel={rel}
    >
      {text}
      {withIcon && <IconCmpExternalIcon className="mt-1" />}
    </a>
  )
}
