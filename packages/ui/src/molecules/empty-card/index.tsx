import clsx from "clsx"
import { HTMLAttributes } from "react"

export interface IEmptyCard extends HTMLAttributes<HTMLDivElement> {
  icon: JSX.Element
  description: string
}

export const EmptyCard = ({ icon, description, className }: IEmptyCard) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full",
        "text-gray-400",
        className,
      )}
    >
      {icon}
      <p className="text-sm text-center max-w-[420px] px-5 mt-5 leading-5">
        {description}
      </p>
    </div>
  )
}
