export interface IDropdownOption {
  label?: string
  icon?: string
  element?: React.ReactNode
  handler?: () => void
}

export const DropdownOption = ({
  label,
  icon,
  element,
  handler,
}: IDropdownOption) => {
  return (
    <div
      className="px-[10px] flex items-center gap-[8px] hover:bg-gray-100 h-[40px] cursor-pointer"
      onClick={() => {
        if (!handler) return
        handler()
      }}
    >
      {element ?? (
        <>
          <img width={24} src={icon} />
          <p className="text-black text-sm">{label}</p>
        </>
      )}
    </div>
  )
}
