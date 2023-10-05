import { ImWarning } from "react-icons/im"

export const ExampleError = ({ children }: { children: string }) => {
  return (
    <div className="flex gap-2 p-2 font-medium text-white bg-red-500 rounded">
      <ImWarning />
      <div className="text-sm">{children}</div>
    </div>
  )
}
