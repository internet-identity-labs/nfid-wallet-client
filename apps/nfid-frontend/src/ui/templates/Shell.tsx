import clsx from "clsx"
import React from "react"

export type BubbleOptions = {
  showBubbles?: boolean
  bubbleColors?: [string, string]
  bubbleClassNames?: [string?, string?]
}

interface ShellProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  bubbleOptions?: BubbleOptions
}

export const Shell: React.FC<ShellProps> = ({
  children,
  className,
  bubbleOptions = {
    showBubbles: true,
    bubbleColors: ["#a69cff", "#4df1ffa8"],
  },
}) => {
  const bubbles = (
    <>
      <div
        className={clsx(
          "fixed rounded-full opacity-[0.5] md:opacity-[0.8] md:top-[15vh] transition duration-500 ease-out",
          bubbleOptions.bubbleClassNames?.[0]
            ? bubbleOptions.bubbleClassNames[0]
            : "right-[-40vw] md:right-[-5vw] 2xl:right-[-10vw]",
          className,
        )}
        style={{
          background: bubbleOptions.bubbleColors?.[0],
          width: "clamp(400px, 25vw, 800px)",
          height: "clamp(400px, 35vh, 800px)",
          zIndex: -1,
          filter: "blur(120px)",
        }}
      />
      <div
        className={clsx(
          "fixed rounded-full opacity-80 md:opacity-100 transition duration-500 ease-out",
          bubbleOptions.bubbleClassNames?.[1]
            ? bubbleOptions.bubbleClassNames[1]
            : "bottom-[-10vh] right-[-10vw] md:bottom-0 md:right-0 lg:-bottom-20 2xl:right-0",
        )}
        style={{
          background: bubbleOptions.bubbleColors?.[1],
          width: "clamp(600px, 30vw, 800px)",
          height: "clamp(400px, 70vh, 850px)",
          zIndex: -1,
          filter: "blur(120px)",
        }}
      />
    </>
  )

  return (
    <div>
      {bubbleOptions.showBubbles ? bubbles : null}

      {children}
    </div>
  )
}
