import clsx from "clsx"
import React from "react"

interface ChallengeProps {
  src?: string
}

export const Challenge: React.FC<ChallengeProps> = ({ src }) => {
  return (
    <div
      className={clsx(
        "h-[150px] w-auto rounded-md my-4",
        "bg-white border border-gray-200",
      )}
    >
      {!src ? (
        <div className="my-auto text-center">Loading challenge ...</div>
      ) : (
        <img alt="captcha" src={src} className="object-contain w-full h-full" />
      )}
    </div>
  )
}
