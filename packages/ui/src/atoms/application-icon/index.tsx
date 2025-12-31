import clsx from "clsx"
import { NoIcon } from "../../assets/no-icon"

interface ApplicationIconProps {
  appName: string
  icon?: string
  className?: string
}

export const ApplicationIcon: React.FC<ApplicationIconProps> = ({
  icon,
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-white rounded-full w-[40px] h-[40px] text-blue",
        "flex items-center justify-center",
        "text-xl font-medium",
        className,
      )}
    >
      {icon ? (
        <img
          className="rounded-full w-[28px] h-[28px] object-contain object-center"
          src={icon}
          alt="app icon"
        />
      ) : (
        <NoIcon className="w-[40px] h-[40px]" />
      )}
    </div>
  )
}
