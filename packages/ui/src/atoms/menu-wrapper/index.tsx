import clsx from "clsx"

interface MenuWrapperProps {
  children: React.ReactNode
}

export const MenuWrapper: React.FC<MenuWrapperProps> = ({ children }) => (
  <div
    className={clsx(
      "px-5 py-2",
      "border-gray-100 border-b",
      "flex items-center",
    )}
  >
    {children}
  </div>
)
