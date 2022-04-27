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
      isFocused
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#FF9533", "rgba(181,123,255,0.5)"],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh]",
          "bottom-[-40vh] md:right-[35vw] md:top-[30vh]",
        ],
      }}
    >
      <main
        className={clsx(
          // MOBILE
          "flex-1 flex flex-col -mt-[80px]",
          "bg-poa-dog-screen bg-contain bg-no-repeat bg-top",
          // MEDIUM
          "md:flex-row-reverse",
          "",
        )}
      >
        {/* SPACER DON'T REMOVE */}
        <div className="flex-grow max-h-[100vw]" />
        <div
          className={clsx(
            // MOBILE
            "flex flex-col flex-shrink z-10 p-4",
            // SMALL
            "md:pt-16 md:max-w-md",
          )}
        >
          <div className={clsx()}>
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
