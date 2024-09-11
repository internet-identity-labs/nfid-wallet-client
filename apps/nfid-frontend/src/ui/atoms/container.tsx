import clsx from "clsx"
import React from "react"

export const CONTAINER_CLASSES = "container mx-auto px-[16px] sm:px-[30px]"

interface ContainerProps {
  children?: React.ReactNode
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className={clsx(CONTAINER_CLASSES)}>{children}</div>
}
