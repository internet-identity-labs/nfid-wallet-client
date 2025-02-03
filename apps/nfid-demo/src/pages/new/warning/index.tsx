import WarningIcon from "../../../assets/warning.svg"

export const Warning = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex items-center space-x-2 p-5 bg-orange-50 h-16 rounded-lg">
      <img
        className="w-6 h-6 rounded-full"
        src={WarningIcon}
        alt="Deprecated Warning"
      />
      <p className="text-sm font-normal text-orange-900">{children}</p>
    </div>
  )
}
