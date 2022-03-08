import React from "react"
import clsx from "clsx"

interface OlProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Ol: React.FC<OlProps> = ({ children, className }) => {
  return (
    <ol className={clsx("list-decimal mb-6 mt-2", className)}>{children}</ol>
  )
}

interface LiProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const Li: React.FC<LiProps> = ({ children, className }) => {
  return <li className={clsx("ml-6", className)}>{children}</li>
}
