interface MenuWrapperProps {
  children: React.ReactNode
}

export const MenuWrapper: React.FC<MenuWrapperProps> = ({ children }) => (
  <div>{children}</div>
)
