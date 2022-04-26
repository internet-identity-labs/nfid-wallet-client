import { Button, H2, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { ArrowLeft } from "frontend/design-system/atoms/icons/arrow-left"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import {
  ProfileConstants,
  ProfileRoutes,
} from "frontend/flows/screens-app/profile/routes"

import { EventSummary } from "../proof-of-attendency/event-summary"
import image_dog from "./dog_image.svg"

interface ProofOfAttendencyAwardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  continueButtonContent: string
  onContinueButtonClick: () => Promise<void>
  isLoading?: boolean
}

export const ProofOfAttendencyAward: React.FC<ProofOfAttendencyAwardProps> = ({
  onContinueButtonClick,
  continueButtonContent,
  isLoading,
}) => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["rgba(255, 149, 51, 0.18)", "#B57BFF"],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh]",
          "bottom-[-10vh] md:right-[20vw] md:top-[30vh]",
        ],
      }}
    >
      <main
        className={clsx(
          // MOBILE
          "container m-auto flex flex-col",
          // SMALL
          "md:flex-1",
        )}
      >
        <div>
          <Link
            to={`${ProfileConstants.base}/${ProfileConstants.authenticate}`}
          >
            <Button icon>
              <ArrowLeft />
            </Button>
          </Link>
        </div>
        <div
          className={clsx(
            // MOBILE
            "container flex flex-col mx-auto",
            // SMALL
            "md:flex-row-reverse",
            // MEDIUM
            "",
          )}
        >
          <div className="flex flex-grow w-60">
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
              "sm:pt-16 sm:max-w-md",
            )}
          >
            <EventSummary />
          </div>
        </div>
        <div
          className={clsx(
            // MOBILE
            "w-full",
            // MEDIUM
            "md:w-1/2 md:ml-auto",
          )}
        >
          <H2>IIWXXXIV Spring 2022</H2>
          <div>
            The Internet Identity Workshop has been finding, probing and solving
            identity problems twice every year since 2005. Every IIW moves
            topics, code and projects downfield. Name an identity topic and it’s
            likely that more substantial discussion and work has been done on it
            at IIW than at any other conference. That’s because IIW is an
            un-conference. We have no speakers, no keynotes, no panels. All
            sessions are breakouts, and the topics are chosen and led by
            participants. And identity is just a starting point. Many other
            topics come up and move forward as well. In the last few IIWs, hot
            topics have included personal clouds, privacy, data liberation,
            verifiable claims, decentralized identifiers, transparency, VRM, the
            Indie Web, the Internet of Things, the Semantic Web, trust
            frameworks, free and open devices and much more. We also make time
            and space available for demos. IIW is cheap, as conferences go. ROI
            is also maximized by absence of company-driven agendas. Corporate
            participation is by humble sponsors who like what IIW does for the
            world — and to supply free meals each day and an all-day espresso
            bar. IIW takes place over three days every Spring and Fall at the
            Computer History Museum in Mountain View. Register now for IIW, and
            do it soon because it’s likely to fill up.
          </div>
        </div>
      </main>
    </AppScreen>
  )
}
