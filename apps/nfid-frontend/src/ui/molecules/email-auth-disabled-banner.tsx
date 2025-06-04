import clsx from "clsx"
import { useState } from "react"

import { IconCmpWarning } from "@nfid-frontend/ui"

export function EmailAuthDisabledBanner({
  bgColor = "#392414FF",
  color = "amber-600",
  onClick,
  linkText = "Don't remind me again",
  className,
}: {
  bgColor?: string
  color?: string
  onClick?: () => {}
  linkText?: string
  className?: string
}) {
  const [showWarning, setShowWarning] = useState(
    localStorage.getItem("showEmailWarning") === "true",
  )

  return (
    <>
      {showWarning && (
        <div
          className={clsx(
            `p-[10px] sm:p-[20px] bg-[${bgColor}] rounded-[12px] text-${color} flex justify-between items-center text-sm mt-[20px] relative z-[100]`,
            className,
          )}
        >
          <IconCmpWarning className="text-amber-600 w-[24px] h-[24px] mr-[20px] flex-none" />
          <div>
            Starting <strong>July 1, 2025</strong>, signing in with Gmail or
            email-based authentication will no longer be supported. To ensure
            uninterrupted access, please set up a passkey and optionally a
            recovery phrase via your account settings.
          </div>
          <br className="block md:hidden" />
          <div
            onClick={
              onClick
                ? onClick
                : () => {
                    setShowWarning(false)
                    localStorage.setItem("showEmailWarning", "false")
                  }
            }
            className={`whitespace-nowrap border-b border-dotted border-${color} ml-[40px] cursor-pointer mt-[10px] md:mt-0`}
          >
            {linkText}
          </div>
        </div>
      )}
    </>
  )
}
