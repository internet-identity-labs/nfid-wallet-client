import { Button, H5 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { Link } from "react-router-dom"

import { ArrowLeft } from "frontend/design-system/atoms/icons/arrow-left"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Footer } from "frontend/flows/screens-app/landing-page/footer"
import { ProfileConstants } from "frontend/flows/screens-app/profile/routes"

import { EventSummary } from "../proof-of-attendency/event-summary"
import image_dog from "./dog_image.svg"

interface ProofOfAttendencyAwardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ProofOfAttendencyAward: React.FC<
  ProofOfAttendencyAwardProps
> = () => {
  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#FF9533", "rgba(181,123,255,0.5)"],
        bubbleClassNames: [
          "right-[-40vw] md:right-[13vw] md:top-[16vh] absolute",
          "bottom-[-40vh] md:right-[35vw] md:top-[30vh] absolute",
        ],
      }}
      navigationItems={<div />}
      className="overflow-hidden"
    >
      <main
        className={clsx(
          // MOBILE
          "container m-auto flex flex-col pb-10 px-3",
          // SMALL
          "md:flex-1",
        )}
      >
        <div className="z-20">
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
            "container flex flex-col mx-auto z-10",
            // SMALL
            "md:flex-row-reverse",
            // MEDIUM
            "",
          )}
        >
          <div className="flex flex-grow -mt-20 md:w-1/2 md:ml-auto min-h-[350px]">
            <img
              src={image_dog}
              className="object-contain object-center mx-auto"
              alt="anonymous dog"
            />
          </div>
          <div
            className={clsx(
              // MOBILE
              "flex flex-col md:w-1/2",
              // SMALL
              "sm:pt-16",
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
            "md:w-1/2 md:ml-auto mt-5",
          )}
        >
          <H5>IIWXXXIV Spring 2022</H5>
          <div className="mt-4">
            The Internet Identity Workshop has been finding, probing and solving
            identity problems twice every year since 2005. Every IIW moves
            topics, code and projects downfield. Name an identity topic and it’s
            likely that more substantial discussion and work has been done on it
            at IIW than at any other conference. <br />
            <br /> That’s because IIW is an un-conference. We have no speakers,
            no keynotes, no panels. All sessions are breakouts, and the topics
            are chosen and led by participants. <br />
            <br /> And identity is just a starting point. Many other topics come
            up and move forward as well. In the last few IIWs, hot topics have
            included personal clouds, privacy, data liberation, verifiable
            claims, decentralized identifiers, transparency, VRM, the Indie Web,
            the Internet of Things, the Semantic Web, trust frameworks, free and
            open devices and much more. We also make time and space available
            for demos. <br />
            <br /> IIW is cheap, as conferences go. ROI is also maximized by
            absence of company-driven agendas. Corporate participation is by
            humble sponsors who like what IIW does for the world — and to supply
            free meals each day and an all-day espresso bar. <br />
            <br /> IIW takes place over three days every Spring and Fall at the
            Computer History Museum in Mountain View. Register now for IIW, and
            do it soon because it’s likely to fill up.
          </div>
        </div>
        <Footer />
      </main>
    </AppScreen>
  )
}
