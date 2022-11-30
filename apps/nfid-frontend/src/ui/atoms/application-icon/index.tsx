import clsx from "clsx"

interface ApplicationIconProps {
  appName: string
  icon?: string
  className?: string
}

export const ApplicationIcon: React.FC<ApplicationIconProps> = ({
  appName,
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
          className="rounded-full w-[26px] h-[26px] object-contain object-center"
          src={icon}
          alt="app icon"
        />
      ) : (
        <div>{appName[0].toUpperCase()}</div>
      )}
    </div>
  )
}
