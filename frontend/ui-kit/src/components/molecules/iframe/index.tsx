import clsx from "clsx"
import React, { useState } from "react"
import { IFrameContent } from "./content"
import { IFrameHeader } from "./header"
import { IFrameWrapper } from "./wrapper"

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  src: string
  onLoad?: () => void
}

export const IFrame: React.FC<Props> = ({
  children,
  className,
  src,
  onLoad,
}) => {
  const [visible, setVisible] = useState(true)
  const [title, setTitle] = useState("")

  React.useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timeout)
  }, [])

  React.useEffect(() => {
    const iframeWrapperCard = document.querySelector(
      "#iframe-wrapper-card",
    ) as HTMLDivElement
    const origin = new URL(src).origin

    window.addEventListener("message", function (event) {
      if (event.origin !== origin) return

      const height = parseInt(event.data.height) + 57
      setTitle(event.data.title)

      iframeWrapperCard.style.height = `${height > 200 ? height : 200}px`
    })
  }, [])

  return visible ? (
    <IFrameWrapper className={clsx(className)}>
      <IFrameHeader onClick={() => setVisible(false)} title={title} />
      <IFrameContent src={src} onLoad={onLoad} />
    </IFrameWrapper>
  ) : null
}
