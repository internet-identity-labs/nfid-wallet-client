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
        className={
          "fixed rounded-full opacity-[0.5] md:opacity-[0.7] top-[10vh] right-[-25vw] lg:right-[-5vw] xl:top-[16vh] 2xl:right-[-10vw] blur-[70px] xl:blur-[120px]"
        }
        style={{
          background: bubbleColors[0],
          width: "clamp(400px, 25vw, 800px)",
          height: "clamp(400px, 35vh, 800px)",
        }}
      />
      <div
        className={
          "fixed rounded-full opacity-[1] md:opacity-[0.8] bottom-[-20vh] right-[-25vw] lg:right-0 lg:-bottom-20 2xl:right-0 blur-[70px] xl:blur-[150px]"
        }
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
