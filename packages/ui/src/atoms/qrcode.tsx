import clsx from "clsx"
import QR, { QRCodeRenderersOptions } from "qrcode"
import React from "react"

interface QRCodeProps {
  content: string
  options?: QRCodeRenderersOptions
}

export const QRCode: React.FC<QRCodeProps> = ({
  content,
  options,
}: QRCodeProps) => {
  const canvas = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (content) {
      QR.toCanvas(
        canvas.current,
        content,
        options || {},
        function (error: any) {
          if (error) console.error(error)
        },
      )
    }
  }, [content, options])

  return (
    <div className={clsx("center relative")}>
      <div
        style={{
          content: "",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          mixBlendMode: "lighten",
        }}
      />
      <canvas ref={canvas} className="m-auto" />
    </div>
  )
}
