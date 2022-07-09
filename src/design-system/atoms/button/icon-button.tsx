import clsx from "clsx"

interface MethodRawProps {
  img: React.ReactElement
  title: string
  subtitle: string
  onClick: React.MouseEventHandler
}

export const IconButton: React.FC<MethodRawProps> = ({
  img,
  title,
  subtitle,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      "flex items-center px-3 py-2 border border-gray-300 rounded-md hover:border-blue-400 transition-all cursor-pointer hover:bg-[#F4FAFF]",
      "w-full max-w-[400px]",
    )}
  >
    <div className="w-[28px] mr-[9px]">{img}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-[11px] text-gray-900">{subtitle}</p>
    </div>
  </div>
)
