import { Button, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

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
  const { isMobile } = useDeviceInfo()
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#FF9533", "rgba(181,123,255,0.5)"],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh]",
          "bottom-[-40vh] md:right-[35vw] md:top-[30vh]",
        ],
      }}
      navigationItems={<div />}
    >
      <main className={clsx("flex flex-1 overflow-x-hidden pb-4 sm:pb-10")}>
        <div
          className={clsx(
            // MOBILE
            "container flex flex-col px-6 py-0 mx-auto sm:py-4 justify-between",
            // SMALL
            "md:flex-row-reverse",
            // MEDIUM
            "",
          )}
        >
          <div />
          <div className="absolute sm:relative flex flex-grow left-0 sm:left-auto w-[100vw] z-10 top-0 sm:top-0">
            <img
              src={image_dog}
              className="object-contain object-center"
              alt="anonymous dog"
            />
          </div>
          <div
            className={clsx(
              // MOBILE
              "flex flex-col z-20",
              // SMALL
              "md:pt-16 md:max-w-md",
            )}
          >
            <EventSummary />
            <div className="font-bold text-md md:text-lg">
              Add this proof of IIW attendance to one of an infinite number of
              your DIDs
            </div>

            <div>
              <Button
                secondary
                onClick={onContinueButtonClick}
                className="mt-8"
                largeMax={isMobile}
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
