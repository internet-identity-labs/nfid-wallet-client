import clsx from "clsx"

export interface IDropdownOption {
  label?: string
  icon?: string
  element?: React.ComponentType<{ className?: string }>
  link?: string
  handler?: () => void
  className?: string
  textClassName?: string
  iconClassName?: string
}

export const DropdownOption = ({
  label,
  icon,
  element: Element,
  handler,
  className,
  textClassName,
  iconClassName,
  link,
}: IDropdownOption) => {
  return (
    <div
      id={`option_${label}`}
      className={clsx(
        "flex items-center gap-[8px] hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer px-[10px]",
        className,
      )}
      onClick={() => {
        if (!handler) return
        handler()
      }}
    >
      {Element ? (
        <Element className="w-full h-[40px] flex items-center" />
      ) : (
        <>
          {icon && (
            <img
              alt="dropdown-icon"
              width={24}
              className={iconClassName}
              src={icon}
            />
          )}
          {link ? (
            <a
              className="w-full h-[40px] px-[10px] flex items-center"
              target="_blank"
              href={link}
              rel="noreferrer"
            >
              {label}
            </a>
          ) : (
            <p
              className={clsx(
                "text-black dark:text-white text-sm w-full h-[40px] px-[10px] flex items-center",
                textClassName,
              )}
            >
              {label}
            </p>
          )}
        </>
      )}
    </div>
  )
}
