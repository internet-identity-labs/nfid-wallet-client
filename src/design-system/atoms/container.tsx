import clsx from "clsx"
import React from "react"

export const CONTAINER_CLASSES = "container mx-auto md:px-5"

interface ContainerProps {
  children?: React.ReactNode
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className={clsx(CONTAINER_CLASSES)}>{children}</div>
}
