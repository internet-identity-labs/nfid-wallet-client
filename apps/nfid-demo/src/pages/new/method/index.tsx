import clsx from "clsx"

export const ExampleMethod = ({ children }: { children: string }) => {
  return (
    <span
      className={clsx(
        "px-2 py-1 ml-1 font-mono text-xs text-white bg-gray-800 rounded-lg",
        "opacity-50 group-hover:opacity-100 transition-opacity",
      )}
    >
      {children}
    </span>
  )
}
