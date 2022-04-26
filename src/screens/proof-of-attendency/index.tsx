import { Button, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { EventSummary } from "./event-summary"
import image_dog from "./image_dog.svg"

interface RegisterAccountIntroProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  continueButtonContent: string
  onContinueButtonClick: () => Promise<void>
  isLoading?: boolean
}

export const ProofOfAttendency: React.FC<RegisterAccountIntroProps> = ({
  onContinueButtonClick,
  continueButtonContent,
  isLoading,
}) => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#FF9533", "rgba(181,123,255,0.4)"],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh]",
          "bottom-[-10vh] md:right-[20vw] md:top-[30vh]",
        ],
      }}
      navigationItems={<div/>}
    >
      <main className={clsx("flex flex-1 overflow-x-hidden")}>
        <div
          className={clsx(
            // MOBILE
            "container flex flex-col px-6 py-0 mx-auto sm:py-4",
            // SMALL
            "md:flex-row-reverse",
            // MEDIUM
            "",
          )}
        >
          <div className="relative flex flex-grow w-[100vw]">
            <img
              src={image_dog}
              className="object-contain object-center"
              alt="anonymous dog"
            />
          </div>
          <div
            className={clsx(
              // MOBILE
              "flex flex-col",
              // SMALL
              "md:pt-16 md:max-w-md",
            )}
          >
            <EventSummary />
            <div className="font-bold">
              Create an NFID to add this proof of attendance badge to your
              identity
            </div>

            <div>
              <Button
                secondary
                onClick={onContinueButtonClick}
                className="mt-8"
              >
                {continueButtonContent}
              </Button>
            </div>

            <Loader isLoading={!!isLoading} />
          </div>
        </div>
      </main>
    </AppScreen>
  )
}
