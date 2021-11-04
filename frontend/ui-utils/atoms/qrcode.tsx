import React from "react"
import QR, { QRCodeRenderersOptions } from "qrcode"
import clsx from "clsx"

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
    <div className={clsx("center")} style={{ cursor: "pointer" }}>
      <canvas ref={canvas} />
    </div>
  )
}
