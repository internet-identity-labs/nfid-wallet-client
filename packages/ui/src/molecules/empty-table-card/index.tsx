import clsx from "clsx"

export interface IEmptyTableCard {
  icon: JSX.Element
  description: string
}

export const EmptyTableCard = ({ icon, description }: IEmptyTableCard) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full",
        "text-gray-400",
      )}
    >
      {icon}
      <p className="text-sm text-center max-w-[420px] px-5 mt-5 leading-5">
        {description}
      </p>
    </div>
  )
}
