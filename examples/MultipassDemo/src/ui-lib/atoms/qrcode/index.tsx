import React from "react"
import QR from "qrcode"
import clsx from "clsx"

interface QRCodeProps {
  content: string
}

export const QRCode: React.FC<QRCodeProps> = ({ content }: QRCodeProps) => {
  const canvas = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (content) {
      QR.toCanvas(canvas.current, content, function (error: any) {
        if (error) console.error(error)
      })
    }
  }, [content])

  return (
    <div className={clsx("center")} style={{ cursor: "pointer" }}>
      <canvas ref={canvas} />
    </div>
  )
}
