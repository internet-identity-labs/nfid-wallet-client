import { IOption } from "."

export interface IDropdownContextMenu {
  options: IOption[]
  setIsDropdownOpen: (v: boolean) => void
}

export const ContextMenu = ({
  options,
  setIsDropdownOpen,
}: IDropdownContextMenu) => {
  return (
    <div className="min-w-[210px] sm:min-w-[250px]">
      {options?.map((option, index) => {
        if (option.label === "Remove token" && !option.value) return null
        return (
          <div
            key={`${option.label}_${index}`}
            className="px-[10px] flex items-center gap-[8px] hover:bg-gray-100 h-[40px]"
            onClick={() => {
              if (!option.handler) return
              option.handler()
              setIsDropdownOpen(false)
            }}
          >
            {option.element ? (
              option.element
            ) : (
              <>
                <img width={24} src={option.icon} />
                {option.label === "View on block explorer" ? (
                  <a
                    href={option.value}
                    target="_blank"
                    className="text-black text-sm"
                  >
                    {option.label}
                  </a>
                ) : (
                  <p className="text-black text-sm">{option.label}</p>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
