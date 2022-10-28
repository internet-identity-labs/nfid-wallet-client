import clsx from "clsx"

export interface SideBarWrapperProps {
  children: React.ReactNode | React.ReactNode[]
}
export const SidebarWrapper: React.FC<SideBarWrapperProps> = ({ children }) => (
  <div className={clsx("flex flex-col space-y-2")}>{children}</div>
)
