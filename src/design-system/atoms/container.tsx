import React from "react"

export const CONTAINER_CLASSES = "container mx-auto"

interface ContainerProps {}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className={CONTAINER_CLASSES}>{children}</div>
}
