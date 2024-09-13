import clsx from "clsx"

export interface IDropdownOption {
  label?: string
  icon?: string
  element?: React.ReactNode
  link?: string
  handler?: () => void
  className?: string
  textClassName?: string
  iconClassName?: string
}

export const DropdownOption = ({
  label,
  icon,
  element,
  handler,
  link,
  className,
  textClassName,
  iconClassName,
}: IDropdownOption) => {
  return (
    <div
      className={clsx(
        "px-[10px] flex items-center gap-[8px] hover:bg-gray-100 h-[40px] cursor-pointer",
        className,
      )}
      onClick={() => {
        if (!handler) return
        handler()
      }}
    >
      {element ?? (
        <>
          {icon && <img width={24} className={iconClassName} src={icon} />}
          {link ? (
            <a target="_blank" href={link}>
              {label}
            </a>
          ) : (
            <p className={clsx("text-black text-sm", textClassName)}>{label}</p>
          )}
        </>
      )}
    </div>
  )
}
