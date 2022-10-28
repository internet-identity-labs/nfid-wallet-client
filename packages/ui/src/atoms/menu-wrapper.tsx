interface MenuWrapperProps {
  children: React.ReactNode
}

export const MenuWrapper: React.FC<MenuWrapperProps> = ({ children }) => (
  <div className="bg-red-400">{children}</div>
)
