import { ReactElement } from "react"

interface MethodRawProps {
  img: ReactElement
  title: string
  subtitle: string
  onClick: React.MouseEventHandler
}

export const MethodRaw: React.FC<MethodRawProps> = ({
  img,
  title,
  subtitle,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="flex items-center w-full px-3 py-2 border border-gray-200 rounded-md hover:border-blue-light transition-all cursor-pointer hover:bg-[#F4FAFF]"
  >
    <div className="w-[28px] mr-[9px]">{img}</div>
    <div>
      <p className="text-sm">{title}</p>
      <p className="text-[11px] text-gray-400">{subtitle}</p>
    </div>
  </div>
)
