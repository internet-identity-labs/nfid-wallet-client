import React from "react"
import clsx from "clsx"

interface ShellProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  showBubbles?: boolean
  bubbleColors?: [string, string]
}

export const Shell: React.FC<ShellProps> = ({
  children,
  className,
  bubbleColors = ["#a69cff", "#79e9f1"],
  showBubbles = false,
}) => {
  const bubbles = (
    <>
      <div
        className="bg-bubble-1"
        style={{
          background: bubbleColors[0],
          width: "clamp(400px, 25vw, 800px)",
          height: "clamp(400px, 35vh, 800px)",
        }}
      />
      <div
        className="bg-bubble-2"
        style={{
          background: bubbleColors[1],
          width: "clamp(600px, 30vw, 800px)",
          height: "clamp(400px, 70vh, 850px)",
        }}
      />
    </>
  )

  return (
    <div className={clsx("", className)}>
      {showBubbles ? bubbles : null}

      {children}
    </div>
  )
}
