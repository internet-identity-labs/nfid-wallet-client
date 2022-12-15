import clsx from "clsx"

export interface IBadge extends React.HTMLAttributes<HTMLDivElement> {
  type: "warning" | "success" | "error" | "cancel"
}

export const Badge = ({ type, children }: IBadge) => {
  return (
    <div
      className={clsx(
        "inline-block px-2 py-1 font-bold text-[10px] tracking-[0.02em] rounded-md",
        type === "warning" && "text-amber-500 bg-amber-50",
        type === "success" && "text-emerald-500 bg-emerald-50",
        type === "error" && "text-red-500 bg-red-50",
        type === "cancel" && "text-gray-500 bg-gray-50",
      )}
    >
      {children}
    </div>
  )
}
