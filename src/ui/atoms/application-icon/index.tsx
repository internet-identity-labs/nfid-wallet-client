interface ApplicationIconProps {
  appName: string
  icon?: string
}

export const ApplicationIcon: React.FC<ApplicationIconProps> = ({
  appName,
  icon,
}) => {
  return icon ? (
    <img className="rounded-full w-[40px] h-[40px]" src={icon} alt="app icon" />
  ) : (
    <div className="flex items-center justify-center text-xl font-medium bg-white rounded-full w-[40px] h-[40px] text-blue-base">
      <div>{appName[0].toUpperCase()}</div>
    </div>
  )
}
